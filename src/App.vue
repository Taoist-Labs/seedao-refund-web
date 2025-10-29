<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
    <div class="container mx-auto px-4 py-8">
      <header class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          SCR Token Burner
        </h1>
        <p class="text-gray-600">
          Burn SCR tokens to receive USDT on Polygon
        </p>
      </header>

      <main class="max-w-3xl mx-auto space-y-6">
        <!-- Wallet Connection -->
        <div class="bg-white rounded-2xl shadow-xl p-6">
          <WalletConnect />
        </div>

        <!-- Main Interface (only show when wallet is connected) -->
        <template v-if="isConnected">
          <!-- Balance Display -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <BalanceDisplay />
          </div>

          <!-- Burn Interface -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <BurnInterface @status-change="handleStatusChange" />
          </div>

          <!-- Transaction Status -->
          <TransactionStatus
            :tx-status="txStatus"
            @close="handleCloseStatus"
          />
        </template>

        <!-- Not Connected Message -->
        <div v-else class="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p class="text-gray-500 text-lg">
            👆 Connect your wallet to get started
          </p>
        </div>
      </main>

      <!-- Footer -->
      <footer class="text-center mt-12 text-gray-500 text-sm">
        <p>
          Powered by Polygon • Built with Vue 3 & Ethers.js v6
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WalletConnect from './components/WalletConnect.vue'
import BalanceDisplay from './components/BalanceDisplay.vue'
import BurnInterface from './components/BurnInterface.vue'
import TransactionStatus from './components/TransactionStatus.vue'
import { useWallet } from './composables/useWallet'
import { useBurn } from './composables/useBurn'

const { isConnected } = useWallet()
const { txStatus, resetStatus } = useBurn()

function handleStatusChange() {
  // Status changes are handled by the composable
}

function handleCloseStatus() {
  resetStatus()
}
</script>

<style>
* {
  box-sizing: border-box;
}

.container {
  max-width: 1200px;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}
</style>
