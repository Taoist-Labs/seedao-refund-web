import { ref } from 'vue'
import { parseUnits } from 'ethers'
import { useWallet } from './useWallet'
import { useContract } from './useContract'
import type { TransactionStatus, BurnResult } from '@/types/contracts'
import { TOKEN_DECIMALS, CONTRACT_ADDRESSES } from '@/utils/constants'

export function useBurn() {
  const { provider, address } = useWallet()
  const { getSCRContractWithSigner, getBurnerContractWithSigner, fetchBalances } = useContract()

  const txStatus = ref<TransactionStatus>({
    status: 'idle',
    message: '',
    txHash: undefined,
    error: undefined,
  })

  /**
   * Check if SCR allowance is sufficient
   */
  async function checkAllowance(amount: string): Promise<boolean> {
    if (!address.value || !provider.value) {
      throw new Error('Wallet not connected')
    }

    try {
      const scrContract = getSCRContractWithSigner()
      if (!scrContract) throw new Error('Contract not available')

      const signer = await provider.value.getSigner()
      const contractWithSigner = scrContract.connect(signer)

      const amountBigInt = parseUnits(amount, TOKEN_DECIMALS.SCR)
      const allowance = await contractWithSigner.allowance(
        address.value,
        CONTRACT_ADDRESSES.BURNER
      )

      return BigInt(allowance) >= amountBigInt
    } catch (error) {
      console.error('Error checking allowance:', error)
      throw error
    }
  }

  /**
   * Approve SCR tokens for burning
   */
  async function approveSCR(amount: string): Promise<boolean> {
    if (!address.value || !provider.value) {
      throw new Error('Wallet not connected')
    }

    try {
      txStatus.value = {
        status: 'approving',
        message: 'Approving SCR tokens...',
      }

      const scrContract = getSCRContractWithSigner()
      if (!scrContract) throw new Error('Contract not available')

      const signer = await provider.value.getSigner()
      const contractWithSigner = scrContract.connect(signer)

      const amountBigInt = parseUnits(amount, TOKEN_DECIMALS.SCR)
      const tx = await contractWithSigner.approve(CONTRACT_ADDRESSES.BURNER, amountBigInt)

      txStatus.value.message = 'Waiting for approval confirmation...'
      txStatus.value.txHash = tx.hash

      await tx.wait()

      txStatus.value = {
        status: 'idle',
        message: 'Approval successful',
        txHash: tx.hash,
      }

      return true
    } catch (error: any) {
      console.error('Error approving SCR:', error)
      txStatus.value = {
        status: 'error',
        message: 'Approval failed',
        error: error.message || 'Unknown error',
      }
      throw error
    }
  }

  /**
   * Burn SCR tokens
   */
  async function burnSCR(amount: string): Promise<BurnResult> {
    if (!address.value || !provider.value) {
      throw new Error('Wallet not connected')
    }

    try {
      // Check allowance first
      const hasAllowance = await checkAllowance(amount)

      if (!hasAllowance) {
        await approveSCR(amount)
      }

      // Now burn
      txStatus.value = {
        status: 'burning',
        message: 'Burning SCR tokens...',
      }

      const burnerContract = getBurnerContractWithSigner()
      if (!burnerContract) throw new Error('Burner contract not available')

      const signer = await provider.value.getSigner()
      const contractWithSigner = burnerContract.connect(signer)

      const amountBigInt = parseUnits(amount, TOKEN_DECIMALS.SCR)
      const tx = await contractWithSigner.burnSCRForUSDT(amountBigInt)

      txStatus.value.message = 'Waiting for burn confirmation...'
      txStatus.value.txHash = tx.hash

      const receipt = await tx.wait()

      if (receipt && receipt.status === 1) {
        txStatus.value = {
          status: 'success',
          message: 'Burn successful! USDT received.',
          txHash: tx.hash,
        }

        // Refresh balances
        await fetchBalances()

        return {
          success: true,
          txHash: tx.hash,
        }
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error: any) {
      console.error('Error burning SCR:', error)
      txStatus.value = {
        status: 'error',
        message: 'Burn failed',
        error: error.message || 'Unknown error',
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
      }
    }
  }

  /**
   * Reset transaction status
   */
  function resetStatus(): void {
    txStatus.value = {
      status: 'idle',
      message: '',
      txHash: undefined,
      error: undefined,
    }
  }

  return {
    txStatus,
    checkAllowance,
    approveSCR,
    burnSCR,
    resetStatus,
  }
}
