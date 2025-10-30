/**
 * Frontend Configuration
 *
 * This file contains all configuration for the frontend app.
 * Update contract addresses after deployment.
 */

export const config = {
  // Contract Addresses (update after deployment)
  contracts: {
    scrToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    usdtToken: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    burner: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
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
