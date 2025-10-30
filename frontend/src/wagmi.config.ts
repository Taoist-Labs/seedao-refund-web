/**
 * Wagmi Configuration
 *
 * Configures wallet connection, chains, and Web3Modal for the app
 */

import { http, createConfig, createStorage } from '@wagmi/vue'
import { polygon } from '@wagmi/vue/chains'
import { injected, walletConnect } from '@wagmi/vue/connectors'
import { createWeb3Modal } from '@web3modal/wagmi'
import { config } from './config'
import { joyid } from './connectors/joyid'

// Define custom Hardhat Local chain
export const hardhatLocal = {
  id: config.networks.hardhatLocal.id,
  name: config.networks.hardhatLocal.name,
  network: 'hardhat',
  nativeCurrency: config.networks.hardhatLocal.nativeCurrency,
  rpcUrls: {
    default: {
      http: [config.networks.hardhatLocal.rpcUrl],
    },
    public: {
      http: [config.networks.hardhatLocal.rpcUrl],
    },
  },
  testnet: true,
} as const

// Get the default chain based on config
const defaultChain = config.defaultNetwork === 'polygon' ? polygon : hardhatLocal

// Create Wagmi config
const wagmiConfigRaw = createConfig({
  chains: [polygon, hardhatLocal],
  transports: {
    [polygon.id]: http(config.networks.polygon.rpcUrl),
    [hardhatLocal.id]: http(config.networks.hardhatLocal.rpcUrl),
  },
  connectors: [
    injected({ target: 'metaMask' }),
    // @ts-ignore - JoyID connector type compatibility
    joyid({
      name: 'JoyID',
      joyidAppURL: 'https://app.joy.id',
    }),
    ...(config.walletConnect.projectId
      ? [
          walletConnect({
            projectId: config.walletConnect.projectId,
            metadata: {
              name: 'SCR Burner',
              description: 'Burn SCR tokens for USDT',
              url: 'http://localhost:3000',
              icons: ['http://localhost:3000/favicon.ico'],
            },
            showQrModal: false,
          }),
        ]
      : []),
  ],
  storage: createStorage({
    storage: window.localStorage,
    key: 'scr-burner.wagmi',
  }),
  ssr: false,
})

export const wagmiConfig = wagmiConfigRaw
export { defaultChain }

// Create Web3Modal instance
export const modal = config.walletConnect.projectId
  ? createWeb3Modal({
      // @ts-ignore - Wagmi connector types have minor version incompatibilities between packages
      wagmiConfig,
      projectId: config.walletConnect.projectId,
      enableAnalytics: false,
      themeMode: 'light',
      themeVariables: {
        '--w3m-accent': '#7c3aed',
        '--w3m-border-radius-master': '8px',
      },
    })
  : null
