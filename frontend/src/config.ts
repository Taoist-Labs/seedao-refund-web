/**
 * Frontend Configuration
 *
 * This file contains all configuration for the frontend app.
 * Update contract addresses after deployment.
 */

export const config = {
  // Contract Addresses (update after deployment)
  contracts: {
    scrToken: '0xE4825A1a31a76f72befa47f7160B132AA03813E0',  // ScoreV4 on Polygon mainnet
    usdtToken: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT on Polygon mainnet
    burner: '0x0000000000000000000000000000000000000000',    // UPDATE AFTER DEPLOYMENT
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
  defaultNetwork: 'polygon' as const,
} as const

export type Config = typeof config
