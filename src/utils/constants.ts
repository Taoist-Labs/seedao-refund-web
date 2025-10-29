// Chain IDs
export const CHAIN_IDS = {
  POLYGON: 137,
  POLYGON_AMOY: 80002,
  HARDHAT: 1337,
  HARDHAT_ALT: 31337,
} as const

export const SUPPORTED_CHAIN_IDS = [
  CHAIN_IDS.POLYGON,
  CHAIN_IDS.HARDHAT,
  CHAIN_IDS.HARDHAT_ALT,
]

// Chain names
export const CHAIN_NAMES: Record<number, string> = {
  [CHAIN_IDS.POLYGON]: 'Polygon Mainnet',
  [CHAIN_IDS.POLYGON_AMOY]: 'Polygon Amoy Testnet',
  [CHAIN_IDS.HARDHAT]: 'Hardhat Network',
  [CHAIN_IDS.HARDHAT_ALT]: 'Hardhat Network',
}

// RPC URLs
export const RPC_URLS: Record<number, string> = {
  [CHAIN_IDS.POLYGON]: 'https://polygon-rpc.com',
  [CHAIN_IDS.POLYGON_AMOY]: 'https://rpc-amoy.polygon.technology',
  [CHAIN_IDS.HARDHAT]: 'http://127.0.0.1:8545',
  [CHAIN_IDS.HARDHAT_ALT]: 'http://127.0.0.1:8545',
}

// Contract addresses (from .env)
export const CONTRACT_ADDRESSES = {
  SCR_TOKEN: import.meta.env.VITE_SCR_TOKEN_ADDRESS || '',
  USDT_TOKEN: import.meta.env.VITE_USDT_TOKEN_ADDRESS || '',
  BURNER: import.meta.env.VITE_BURNER_CONTRACT_ADDRESS || '',
}

// WalletConnect Project ID
export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''

// Token decimals
export const TOKEN_DECIMALS = {
  SCR: 18,
  USDT: 6,
} as const
