import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core Vue framework
          'vue-core': ['vue'],

          // Blockchain libraries - only loaded when needed
          'web3-wagmi': ['@wagmi/core', '@wagmi/vue'],
          'web3-viem': ['viem'],
          'web3-modal': ['@web3modal/wagmi'],
          'web3-joyid': ['@joyid/evm'],

          // Query client
          'vue-query': ['@tanstack/vue-query']
        }
      }
    },
    // Increase chunk size warning limit since we're intentionally creating larger vendor chunks
    chunkSizeWarningLimit: 600
  }
})
