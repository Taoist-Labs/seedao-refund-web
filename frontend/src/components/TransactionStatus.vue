<template>
  <div v-if="txStatus.status !== 'idle'" class="transaction-status">
    <!-- Loading States -->
    <div v-if="txStatus.status === 'approving' || txStatus.status === 'burning'" class="status-loading">
      <div class="spinner"></div>
      <p class="status-message">{{ txStatus.message }}</p>
      <p v-if="txStatus.txHash" class="tx-hash">
        Tx: {{ shortTxHash }}
      </p>
    </div>

    <!-- Success State -->
    <div v-else-if="txStatus.status === 'success'" class="status-success">
      <div class="success-icon">✅</div>
      <p class="status-message">{{ txStatus.message }}</p>
      <a
        v-if="txStatus.txHash"
        :href="getExplorerUrl(txStatus.txHash)"
        target="_blank"
        rel="noopener noreferrer"
        class="explorer-link"
      >
        View on Explorer →
      </a>
      <button @click="handleClose" class="close-btn">Close</button>
    </div>

    <!-- Error State -->
    <div v-else-if="txStatus.status === 'error'" class="status-error">
      <div class="error-icon">❌</div>
      <p class="status-message">{{ txStatus.message }}</p>
      <p v-if="txStatus.error" class="error-details">{{ txStatus.error }}</p>
      <button @click="handleClose" class="close-btn">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TransactionStatus } from '@/types/contracts'
import { useWagmiWallet } from '@/composables/useWagmiWallet'
import { config } from '@/config'

interface Props {
  txStatus: TransactionStatus
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const { chainId } = useWagmiWallet()

const shortTxHash = computed(() => {
  if (!props.txStatus.txHash) return ''
  return `${props.txStatus.txHash.slice(0, 10)}...${props.txStatus.txHash.slice(-8)}`
})

function getExplorerUrl(txHash: string): string {
  const chain = chainId.value

  if (chain === config.networks.polygon.id) {
    return `https://polygonscan.com/tx/${txHash}`
  } else {
    // Local network - no explorer
    return '#'
  }
}

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.transaction-status {
  margin-top: 1.5rem;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 2px solid #e5e7eb;
}

.status-loading,
.status-success,
.status-error {
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  border: 4px solid #f3f4f6;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.success-icon,
.error-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.status-message {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.tx-hash,
.error-details {
  font-family: monospace;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 1rem;
  word-break: break-all;
}

.explorer-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: #7c3aed;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.explorer-link:hover {
  color: #6d28d9;
  text-decoration: underline;
}

.close-btn {
  padding: 0.5rem 1.5rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
}

.status-success {
  border-color: #10b981;
  background: #ecfdf5;
}

.status-error {
  border-color: #ef4444;
  background: #fef2f2;
}
</style>
