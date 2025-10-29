<template>
  <div class="balance-display">
    <h3 class="balance-title">Your Balances</h3>
    <div class="balances">
      <div class="balance-item">
        <span class="token-name">SCR</span>
        <span class="token-amount">{{ formattedBalances.scr }}</span>
      </div>
      <div class="balance-item">
        <span class="token-name">USDT</span>
        <span class="token-amount">{{ formattedBalances.usdt }}</span>
      </div>
    </div>
    <button
      v-if="isConnected"
      @click="handleRefresh"
      :disabled="isLoading"
      class="refresh-btn"
    >
      {{ isLoading ? 'Loading...' : '🔄 Refresh' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useWallet } from '@/composables/useWallet'
import { useContract } from '@/composables/useContract'

const { isConnected } = useWallet()
const { formattedBalances, isLoading, fetchBalances } = useContract()

async function handleRefresh() {
  try {
    await fetchBalances()
  } catch (error) {
    console.error('Failed to refresh balances:', error)
  }
}

// Fetch balances when wallet connects
watch(isConnected, (connected) => {
  if (connected) {
    handleRefresh()
  }
})

onMounted(() => {
  if (isConnected.value) {
    handleRefresh()
  }
})
</script>

<style scoped>
.balance-display {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.balance-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.balances {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.token-name {
  font-weight: 600;
  color: #6b7280;
}

.token-amount {
  font-family: monospace;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

.refresh-btn {
  width: 100%;
  padding: 0.5rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
