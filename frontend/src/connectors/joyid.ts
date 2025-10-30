/**
 * JoyID Wagmi Connector
 *
 * Custom Wagmi connector for JoyID wallet integration
 */

import { createConnector } from '@wagmi/core'
import { initConfig, connect as joyidConnect, getConnectedAddress } from '@joyid/evm'

export interface JoyIDConnectorParameters {
  name?: string
  joyidAppURL?: string
}

joyid.type = 'joyid' as const

export function joyid(parameters: JoyIDConnectorParameters = {}) {
  const {
    name = 'JoyID',
    joyidAppURL = 'https://app.joy.id',
  } = parameters

  let connectedAddress: string | undefined

  return createConnector<unknown>((config) => ({
    id: 'joyid',
    name,
    type: joyid.type,

    async setup() {
      // Initialize JoyID configuration
      initConfig({
        name: 'SCR Burner',
        logo: 'https://app.joy.id/logo.png',
        joyidAppURL,
      })
    },

    // @ts-ignore - Wagmi type compatibility
    async connect({ chainId } = {}) {
      try {
        // Connect with JoyID
        const address = await joyidConnect()

        if (!address) {
          throw new Error('Failed to connect to JoyID')
        }

        connectedAddress = address

        // Get the current chain ID from config
        const currentChainId = chainId ?? config.chains[0].id

        return {
          accounts: [address as `0x${string}`] as readonly [`0x${string}`, ...`0x${string}`[]],
          chainId: currentChainId,
        }
      } catch (error) {
        console.error('JoyID connection error:', error)
        throw error
      }
    },

    async disconnect() {
      connectedAddress = undefined
    },

    async getAccounts() {
      if (!connectedAddress) {
        const address = getConnectedAddress()
        if (address) {
          connectedAddress = address
        }
      }
      return connectedAddress ? [connectedAddress as `0x${string}`] : []
    },

    async getChainId() {
      // JoyID doesn't manage chains directly, return the first supported chain
      return config.chains[0].id
    },

    async isAuthorized() {
      const address = getConnectedAddress()
      if (address) {
        connectedAddress = address
        return true
      }
      return false
    },

    async getProvider() {
      // JoyID doesn't expose a provider, return a minimal object
      return {}
    },

    async switchChain() {
      throw new Error('JoyID does not support chain switching. Please reconnect.')
    },

    onAccountsChanged() {
      // JoyID doesn't emit account change events
    },

    onChainChanged() {
      // JoyID doesn't emit chain change events
    },

    onDisconnect() {
      connectedAddress = undefined
    },
  }))
}
