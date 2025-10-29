import { ref, computed } from 'vue'
import { formatUnits, parseUnits } from 'ethers'
import type { BrowserProvider, Contract } from 'ethers'
import { useWallet } from './useWallet'
import { getSCRContract, getUSDTContract, getBurnerContract } from '@/utils/contracts'
import type { TokenBalance, BurnRate } from '@/types/contracts'
import { TOKEN_DECIMALS } from '@/utils/constants'

export function useContract() {
  const { provider, address, isConnected } = useWallet()

  const balances = ref<TokenBalance>({
    scr: 0n,
    usdt: 0n,
  })

  const burnRate = ref<BurnRate>({
    numerator: 0n,
    denominator: 0n,
    displayRate: '0',
  })

  const isLoading = ref(false)

  /**
   * Get SCR contract with signer
   */
  function getSCRContractWithSigner(): Contract | null {
    if (!provider.value) return null
    const contract = getSCRContract(provider.value)
    return contract
  }

  /**
   * Get USDT contract with signer
   */
  function getUSDTContractWithSigner(): Contract | null {
    if (!provider.value) return null
    const contract = getUSDTContract(provider.value)
    return contract
  }

  /**
   * Get Burner contract with signer
   */
  function getBurnerContractWithSigner(): Contract | null {
    if (!provider.value) return null
    const contract = getBurnerContract(provider.value)
    return contract
  }

  /**
   * Fetch user balances
   */
  async function fetchBalances(): Promise<void> {
    if (!address.value || !provider.value) {
      balances.value = { scr: 0n, usdt: 0n }
      return
    }

    try {
      isLoading.value = true

      const scrContract = getSCRContract(provider.value)
      const usdtContract = getUSDTContract(provider.value)

      const [scrBalance, usdtBalance] = await Promise.all([
        scrContract.balanceOf(address.value),
        usdtContract.balanceOf(address.value),
      ])

      balances.value = {
        scr: scrBalance as bigint,
        usdt: usdtBalance as bigint,
      }
    } catch (error) {
      console.error('Error fetching balances:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch current burn rate
   */
  async function fetchBurnRate(): Promise<void> {
    if (!provider.value) return

    try {
      isLoading.value = true

      const burnerContract = getBurnerContract(provider.value)
      const [numerator, denominator] = await burnerContract.getCurrentRate()

      const rate = Number(numerator) / Number(denominator)
      const displayRate = rate.toFixed(4)

      burnRate.value = {
        numerator: numerator as bigint,
        denominator: denominator as bigint,
        displayRate,
      }
    } catch (error) {
      console.error('Error fetching burn rate:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Calculate USDT amount for given SCR amount
   */
  function calculateUSDTAmount(scrAmount: string): string {
    if (!scrAmount || !burnRate.value.numerator || !burnRate.value.denominator) {
      return '0'
    }

    try {
      const scrBigInt = parseUnits(scrAmount, TOKEN_DECIMALS.SCR)
      const usdtBigInt =
        (scrBigInt * burnRate.value.numerator) / burnRate.value.denominator

      // Adjust for decimal difference (SCR: 18, USDT: 6)
      const adjustedUSDT = usdtBigInt / BigInt(10 ** (TOKEN_DECIMALS.SCR - TOKEN_DECIMALS.USDT))

      return formatUnits(adjustedUSDT, TOKEN_DECIMALS.USDT)
    } catch (error) {
      console.error('Error calculating USDT amount:', error)
      return '0'
    }
  }

  /**
   * Formatted balances for display
   */
  const formattedBalances = computed(() => ({
    scr: formatUnits(balances.value.scr, TOKEN_DECIMALS.SCR),
    usdt: formatUnits(balances.value.usdt, TOKEN_DECIMALS.USDT),
  }))

  return {
    // State
    balances,
    formattedBalances,
    burnRate,
    isLoading,

    // Contract getters
    getSCRContractWithSigner,
    getUSDTContractWithSigner,
    getBurnerContractWithSigner,

    // Methods
    fetchBalances,
    fetchBurnRate,
    calculateUSDTAmount,
  }
}
