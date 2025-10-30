import { createApp } from 'vue'
import { WagmiPlugin } from '@wagmi/vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import './style.css'
import App from './App.vue'
import { wagmiConfig } from './wagmi.config'

const queryClient = new QueryClient()

const app = createApp(App)

app.use(WagmiPlugin, { config: wagmiConfig })
app.use(VueQueryPlugin, { queryClient })

app.mount('#app')
