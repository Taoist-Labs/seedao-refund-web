/**
 * Frontend Configuration
 *
 * This file contains all configuration for the frontend app.
 * Update contract addresses after deployment.
 */

export const config = {
  // Contract Addresses (update after deployment)
  contracts: {
    scrToken: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
    usdtToken: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
    burner: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
  },

  // Supported Networks
  networks: {
    hardhatLocal: {
      id: 1337,
      name: 'Hardhat Local',
      rpcUrl: 'http://127.0.0.1:8545',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
    },
    polygon: {
      id: 137,
      name: 'Polygon Mainnet',
      rpcUrl: 'https://polygon-rpc.com',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
    },
  },

  // Token Decimals
  tokenDecimals: {
    scr: 18,
    usdt: 6,
  },

  // WalletConnect Project ID (optional)
  walletConnect: {
    projectId: 'da76ddd6c7d31632ed7fc9b88e28a410', // Add your WalletConnect project ID here if needed
  },

  // Default network
  defaultNetwork: 'hardhatLocal' as const,
} as const

export type Config = typeof config
