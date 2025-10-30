export interface BurnResult {
  success: boolean
  txHash?: string
  error?: string
}

export interface TokenBalance {
  scr: bigint
  usdt: bigint
}

export interface BurnRate {
  numerator: bigint
  denominator: bigint
  displayRate: string // e.g., "0.03"
}

export interface TransactionStatus {
  status: 'idle' | 'approving' | 'burning' | 'success' | 'error'
  message: string
  txHash?: string
  error?: string
}
