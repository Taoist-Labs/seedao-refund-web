import { reactive, computed } from 'vue'
import { BrowserProvider } from 'ethers'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import type { WalletState, WalletType, WalletError } from '@/types/wallet'
import { SUPPORTED_CHAIN_IDS, WALLETCONNECT_PROJECT_ID, RPC_URLS, CHAIN_NAMES } from '@/utils/constants'

const state = reactive<WalletState>({
  address: null,
  provider: null,
  chainId: null,
  walletType: null,
  isConnected: false,
  isConnecting: false,
})

export function useWallet() {
  const isConnected = computed(() => state.isConnected)
  const address = computed(() => state.address)
  const chainId = computed(() => state.chainId)
  const walletType = computed(() => state.walletType)
  const provider = computed(() => state.provider)
  const isConnecting = computed(() => state.isConnecting)

  const chainName = computed(() => {
    if (!state.chainId) return ''
    return CHAIN_NAMES[state.chainId] || `Unknown Chain (${state.chainId})`
  })

  const isCorrectChain = computed(() => {
    return state.chainId ? SUPPORTED_CHAIN_IDS.includes(state.chainId) : false
  })

  /**
   * Connect with MetaMask
   */
  async function connectMetaMask(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    try {
      state.isConnecting = true

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Create provider
      const provider = new BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()

      state.address = accounts[0]
      state.provider = provider
      state.chainId = Number(network.chainId)
      state.walletType = 'metamask'
      state.isConnected = true

      // Setup event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

    } catch (error: any) {
      console.error('MetaMask connection error:', error)
      throw error
    } finally {
      state.isConnecting = false
    }
  }

  /**
   * Connect with WalletConnect
   */
  async function connectWalletConnect(): Promise<void> {
    if (!WALLETCONNECT_PROJECT_ID) {
      throw new Error('WalletConnect Project ID is not configured')
    }

    try {
      state.isConnecting = true

      // Initialize WalletConnect provider
      const wcProvider = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        chains: SUPPORTED_CHAIN_IDS,
        showQrModal: true,
        rpcMap: RPC_URLS,
      })

      // Connect
      await wcProvider.connect()

      // Create ethers provider
      const provider = new BrowserProvider(wcProvider as any)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      state.address = address
      state.provider = provider
      state.chainId = Number(network.chainId)
      state.walletType = 'walletconnect'
      state.isConnected = true

      // Setup event listeners
      wcProvider.on('accountsChanged', handleAccountsChanged)
      wcProvider.on('chainChanged', handleChainChanged)
      wcProvider.on('disconnect', handleDisconnect)

    } catch (error: any) {
      console.error('WalletConnect connection error:', error)
      throw error
    } finally {
      state.isConnecting = false
    }
  }

  /**
   * Connect with JoyID
   * Note: JoyID requires ethers v5, using with v6 may have compatibility issues
   */
  async function connectJoyID(): Promise<void> {
    try {
      state.isConnecting = true

      // Import JoyID dynamically
      const { connect, getEthersProvider } = await import('@joyid/ethers')

      // Connect with JoyID
      const authData = await connect()

      if (!authData) {
        throw new Error('JoyID connection failed')
      }

      // Get provider (note: this may not work perfectly with ethers v6)
      const joyidProvider = getEthersProvider()
      const provider = new BrowserProvider(joyidProvider as any)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      state.address = address
      state.provider = provider
      state.chainId = Number(network.chainId)
      state.walletType = 'joyid'
      state.isConnected = true

    } catch (error: any) {
      console.error('JoyID connection error:', error)
      throw new Error('JoyID is not fully compatible with ethers v6. Please use MetaMask or WalletConnect.')
    } finally {
      state.isConnecting = false
    }
  }

  /**
   * Switch to a specific chain
   */
  async function switchChain(targetChainId: number): Promise<void> {
    if (!state.provider) {
      throw new Error('No wallet connected')
    }

    try {
      const chainIdHex = `0x${targetChainId.toString(16)}`

      if (state.walletType === 'metamask' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        })
      } else {
        throw new Error('Chain switching is only supported with MetaMask')
      }
    } catch (error: any) {
      // If chain doesn't exist, try to add it
      if (error.code === 4902) {
        await addChain(targetChainId)
      } else {
        throw error
      }
    }
  }

  /**
   * Add a new chain to the wallet
   */
  async function addChain(chainId: number): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    const chainIdHex = `0x${chainId.toString(16)}`
    const params = {
      chainId: chainIdHex,
      chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
      rpcUrls: [RPC_URLS[chainId]],
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [params],
    })
  }

  /**
   * Disconnect wallet
   */
  function disconnect(): void {
    // Clean up event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }

    // Reset state
    state.address = null
    state.provider = null
    state.chainId = null
    state.walletType = null
    state.isConnected = false
  }

  /**
   * Event handlers
   */
  function handleAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) {
      disconnect()
    } else {
      state.address = accounts[0]
    }
  }

  function handleChainChanged(chainId: string): void {
    // Reload to avoid state inconsistencies
    window.location.reload()
  }

  function handleDisconnect(): void {
    disconnect()
  }

  return {
    // State
    isConnected,
    address,
    chainId,
    chainName,
    walletType,
    provider,
    isConnecting,
    isCorrectChain,

    // Methods
    connectMetaMask,
    connectWalletConnect,
    connectJoyID,
    switchChain,
    disconnect,
  }
}
