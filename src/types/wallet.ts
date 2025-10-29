import type { BrowserProvider } from 'ethers'

export type WalletType = 'metamask' | 'walletconnect' | 'joyid' | null

export interface WalletState {
  address: string | null
  provider: BrowserProvider | null
  chainId: number | null
  walletType: WalletType
  isConnected: boolean
  isConnecting: boolean
}

export interface WalletError {
  message: string
  code?: string | number
}
