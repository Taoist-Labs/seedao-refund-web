<template>
  <div class="wallet-connect">
    <!-- Connected State -->
    <div v-if="isConnected" class="connected-state">
      <div class="wallet-info">
        <div class="wallet-badge">
          <span class="wallet-icon">{{ walletIcon }}</span>
          <span class="wallet-type">{{ walletTypeDisplay }}</span>
        </div>
        <div class="address-display">
          <span class="address">{{ shortAddress }}</span>
          <span v-if="!isCorrectChain" class="chain-warning">
            ⚠️ {{ chainName }}
          </span>
        </div>
      </div>
      <button
        @click="handleDisconnect"
        class="btn btn-secondary btn-sm"
      >
        Disconnect
      </button>
    </div>

    <!-- Not Connected State -->
    <div v-else class="not-connected-state">
      <h3 class="connect-title">Connect Your Wallet</h3>
      <div class="wallet-buttons">
        <button
          @click="connectWithMetaMask"
          :disabled="isConnecting"
          class="wallet-btn"
        >
          <span class="wallet-btn-icon">🦊</span>
          <span class="wallet-btn-text">MetaMask</span>
        </button>

        <button
          @click="connectWithWalletConnect"
          :disabled="isConnecting"
          class="wallet-btn"
        >
          <span class="wallet-btn-icon">🔗</span>
          <span class="wallet-btn-text">WalletConnect</span>
        </button>

        <button
          @click="connectWithJoyID"
          :disabled="isConnecting"
          class="wallet-btn"
          title="JoyID may have compatibility issues with ethers v6"
        >
          <span class="wallet-btn-icon">😊</span>
          <span class="wallet-btn-text">JoyID</span>
        </button>
      </div>

      <p v-if="isConnecting" class="connecting-text">
        Connecting...
      </p>

      <p v-if="error" class="error-text">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWallet } from '@/composables/useWallet'

const {
  isConnected,
  isConnecting,
  address,
  chainName,
  walletType,
  isCorrectChain,
  connectMetaMask,
  connectWalletConnect,
  connectJoyID,
  disconnect,
} = useWallet()

const error = ref<string>('')

const shortAddress = computed(() => {
  if (!address.value) return ''
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
})

const walletTypeDisplay = computed(() => {
  if (!walletType.value) return ''
  return walletType.value.charAt(0).toUpperCase() + walletType.value.slice(1)
})

const walletIcon = computed(() => {
  switch (walletType.value) {
    case 'metamask':
      return '🦊'
    case 'walletconnect':
      return '🔗'
    case 'joyid':
      return '😊'
    default:
      return '👛'
  }
})

async function connectWithMetaMask() {
  error.value = ''
  try {
    await connectMetaMask()
  } catch (e: any) {
    error.value = e.message || 'Failed to connect'
  }
}

async function connectWithWalletConnect() {
  error.value = ''
  try {
    await connectWalletConnect()
  } catch (e: any) {
    error.value = e.message || 'Failed to connect'
  }
}

async function connectWithJoyID() {
  error.value = ''
  try {
    await connectJoyID()
  } catch (e: any) {
    error.value = e.message || 'JoyID connection failed. Please use MetaMask or WalletConnect.'
  }
}

function handleDisconnect() {
  disconnect()
  error.value = ''
}
</script>

<style scoped>
.wallet-connect {
  width: 100%;
}

.connected-state {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.wallet-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.wallet-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.wallet-icon {
  font-size: 1.25rem;
}

.address-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.address {
  font-family: monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.chain-warning {
  font-size: 0.75rem;
  color: #f59e0b;
  background: #fef3c7;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.not-connected-state {
  text-align: center;
}

.connect-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
}

.wallet-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.wallet-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.wallet-btn:hover:not(:disabled) {
  border-color: #7c3aed;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);
}

.wallet-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wallet-btn-icon {
  font-size: 2rem;
}

.wallet-btn-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.connecting-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.error-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee2e2;
  border-radius: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .wallet-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
