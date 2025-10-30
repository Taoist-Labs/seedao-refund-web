/**
 * Wagmi Wallet Composable
 *
 * Provides wallet connection functionality using Wagmi and Web3Modal
 */

import { computed } from 'vue'
import { useAccount, useDisconnect, useSwitchChain, useConnectorClient } from '@wagmi/vue'
import { BrowserProvider } from 'ethers'
import { modal, hardhatLocal } from '../wagmi.config'
import { config } from '../config'

export function useWagmiWallet() {
  // Wagmi hooks
  const { address, isConnected, chainId: wagmiChainId, connector } = useAccount()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const { switchChainAsync } = useSwitchChain()
  const { data: walletClient } = useConnectorClient()

  // Convert chainId from bigint to number for compatibility
  const chainId = computed(() => (wagmiChainId.value ? Number(wagmiChainId.value) : null))

  // Get chain name
  const chainName = computed(() => {
    if (!chainId.value) return ''
    for (const network of Object.values(config.networks)) {
      if (network.id === chainId.value || (chainId.value === 31337 && network.id === 1337)) {
        return network.name
      }
    }
    return `Unknown Chain (${chainId.value})`
  })

  // Check if on correct chain
  const isCorrectChain = computed(() => {
    if (!chainId.value) return false
    const supportedIds = [config.networks.polygon.id, config.networks.hardhatLocal.id, 31337]
    return supportedIds.includes(chainId.value)
  })

  // Get wallet type (for compatibility)
  const walletType = computed(() => {
    if (!connector.value) return null
    const connectorName = connector.value.name.toLowerCase()
    if (connectorName.includes('metamask')) return 'metamask'
    if (connectorName.includes('walletconnect')) return 'walletconnect'
    return 'unknown'
  })

  // Get ethers provider (for backward compatibility)
  const provider = computed(() => {
    if (!walletClient.value) return null
    // Create ethers BrowserProvider from Wagmi's walletClient
    return new BrowserProvider(walletClient.value as any)
  })

  // Loading state (for compatibility)
  const isConnecting = computed(() => false) // Wagmi handles this internally

  /**
   * Open Web3Modal to connect wallet
   */
  function openModal() {
    if (modal) {
      modal.open()
    } else {
      throw new Error('Web3Modal is not configured. Please add a WalletConnect Project ID.')
    }
  }

  /**
   * Connect with MetaMask - uses Web3Modal
   */
  async function connectMetaMask(): Promise<void> {
    openModal()
  }

  /**
   * Connect with WalletConnect - uses Web3Modal
   */
  async function connectWalletConnect(): Promise<void> {
    openModal()
  }

  /**
   * Disconnect wallet
   */
  function disconnect(): void {
    wagmiDisconnect()
  }

  /**
   * Switch to a specific chain
   */
  async function switchChain(targetChainId: number): Promise<void> {
    await switchChainAsync({ chainId: targetChainId })
  }

  /**
   * Switch to Hardhat Local network
   */
  async function switchToHardhatLocal(): Promise<void> {
    await switchChain(hardhatLocal.id)
  }

  /**
   * Switch to Polygon Mainnet
   */
  async function switchToPolygon(): Promise<void> {
    await switchChain(config.networks.polygon.id)
  }

  /**
   * Connect with JoyID - uses Web3Modal
   */
  async function connectJoyID(): Promise<void> {
    openModal()
  }

  return {
    // State
    address,
    isConnected,
    chainId,
    chainName,
    isCorrectChain,
    walletType,
    provider,
    isConnecting,

    // Methods
    openModal,
    connectMetaMask,
    connectWalletConnect,
    connectJoyID,
    disconnect,
    switchChain,
    switchToHardhatLocal,
    switchToPolygon,
  }
}
