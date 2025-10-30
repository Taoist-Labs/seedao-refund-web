import { ref } from 'vue'
import { parseUnits } from 'ethers'
import { useWagmiWallet } from './useWagmiWallet'
import { useContract } from './useContract'
import type { TransactionStatus, BurnResult } from '@/types/contracts'
import { config } from '../config'

// Shared state - singleton pattern
const txStatus = ref<TransactionStatus>({
  status: 'idle',
  message: '',
  txHash: undefined,
  error: undefined,
})

export function useBurn() {
  const { provider, address } = useWagmiWallet()
  const { getSCRContractWithSigner, getBurnerContractWithSigner, fetchBalances } = useContract()

  /**
   * Check if SCR allowance is sufficient
   */
  async function checkAllowance(amount: string): Promise<boolean> {
    if (!address.value || !provider.value) {
      throw new Error('Wallet not connected')
    }

    try {
      const scrContract = await getSCRContractWithSigner()
      if (!scrContract) throw new Error('Contract not available')

      const amountStr = String(amount)
      const amountBigInt = parseUnits(amountStr, config.tokenDecimals.scr)
      const allowance = await scrContract.allowance(
        address.value,
        config.contracts.burner
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

      const scrContract = await getSCRContractWithSigner()
      if (!scrContract) throw new Error('Contract not available')

      const amountStr = String(amount)
      const amountBigInt = parseUnits(amountStr, config.tokenDecimals.scr)
      const tx = await scrContract.approve(config.contracts.burner, amountBigInt)

      txStatus.value.message = 'Waiting for approval confirmation...'
      txStatus.value.txHash = tx.hash

      await tx.wait()

      console.log('[approveSCR] Approval confirmed')

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
    console.log('[burnSCR] Starting burn...', { amount, address: address.value })

    if (!address.value || !provider.value) {
      throw new Error('Wallet not connected')
    }

    try {
      // Check allowance first
      console.log('[burnSCR] Checking allowance...')
      const hasAllowance = await checkAllowance(amount)
      console.log('[burnSCR] Has allowance:', hasAllowance)

      if (!hasAllowance) {
        console.log('[burnSCR] Approving SCR...')
        await approveSCR(amount)
        console.log('[burnSCR] Approval complete')
      }

      // Now burn
      console.log('[burnSCR] Starting burn transaction...')
      txStatus.value = {
        status: 'burning',
        message: 'Burning SCR tokens...',
      }

      const burnerContract = await getBurnerContractWithSigner()
      if (!burnerContract) throw new Error('Burner contract not available')

      const amountStr = String(amount)
      const amountBigInt = parseUnits(amountStr, config.tokenDecimals.scr)

      console.log('[burnSCR] Calling burnSCRForUSDT with amount:', amountBigInt.toString())
      const tx = await burnerContract.burnSCRForUSDT(amountBigInt)

      console.log('[burnSCR] Transaction sent:', tx.hash)
      txStatus.value.message = 'Waiting for burn confirmation...'
      txStatus.value.txHash = tx.hash

      console.log('[burnSCR] Waiting for confirmation...')
      const receipt = await tx.wait()

      console.log('[burnSCR] Receipt:', receipt)

      if (receipt && receipt.status === 1) {
        console.log('[burnSCR] Burn successful!')
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
      console.error('[burnSCR] Error burning SCR:', error)
      console.error('[burnSCR] Error details:', {
        message: error.message,
        code: error.code,
        reason: error.reason,
        data: error.data,
      })

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
