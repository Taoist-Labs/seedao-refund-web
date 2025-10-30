/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_SCR_TOKEN_ADDRESS: string
  readonly VITE_USDT_TOKEN_ADDRESS: string
  readonly VITE_BURNER_CONTRACT_ADDRESS: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Ethereum provider types
interface EthereumProvider {
  isMetaMask?: boolean
  request(args: { method: string; params?: any[] }): Promise<any>
  on(event: string, handler: (...args: any[]) => void): void
  removeListener(event: string, handler: (...args: any[]) => void): void
}

interface Window {
  ethereum?: EthereumProvider
}
