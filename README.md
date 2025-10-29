# SCR Token Burner

A Web3 application that allows users to burn SCR tokens and receive USDT on Polygon mainnet at a configurable exchange rate.

## Features

- 🔥 Burn SCR tokens to receive USDT
- ⚙️ Configurable burn rate (owner can update)
- 👛 Multi-wallet support (MetaMask, WalletConnect, JoyID)
- 📊 Real-time balance display
- 🔄 Transaction status tracking
- 🎨 Clean, modern UI with Tailwind CSS

## Tech Stack

### Frontend
- **Vue 3** with TypeScript
- **Vite** - Build tool
- **Ethers.js v6** - Ethereum library
- **Tailwind CSS** - Styling

### Smart Contracts
- **Solidity 0.8.20**
- **Hardhat** - Development environment
- **OpenZeppelin** - Smart contract library
- **TypeChain** - TypeScript bindings

### Wallets
- MetaMask (window.ethereum)
- WalletConnect v2
- JoyID (limited compatibility with ethers v6)

## Project Structure

```
seedao-refund-web/
├── contracts/          # Smart contracts
│   ├── TestSCR.sol    # Test SCR token
│   ├── TestUSDT.sol   # Test USDT token
│   └── SCRBurner.sol  # Main burning contract
├── scripts/           # Deployment scripts
├── test/             # Contract tests
├── src/
│   ├── components/   # Vue components
│   ├── composables/  # Vue composables
│   ├── types/       # TypeScript types
│   └── utils/       # Utilities
├── hardhat.config.ts
├── vite.config.ts
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or another Web3 wallet

### Installation

1. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Compile smart contracts:**
   ```bash
   npm run compile
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

### Local Development

1. **Start local Hardhat network:**
   ```bash
   npm run node
   ```

2. **In a new terminal, deploy contracts:**
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```

3. **Copy the contract addresses and update `.env`:**
   ```bash
   cp .env.example .env
   # Edit .env with the deployed contract addresses
   ```

4. **Start the dev server:**
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000**

### Testing the Workflow

1. **Connect MetaMask to local Hardhat network:**
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

2. **Import a test account:**
   - Use one of the private keys from the Hardhat node output
   - You should have test ETH for gas

3. **Get test tokens:**
   - The deployer account already has SCR and USDT
   - Or use the faucet functions in the contracts

4. **Test the burn flow:**
   - Connect wallet
   - Check balances
   - Enter SCR amount to burn
   - Approve transaction
   - Burn transaction
   - Verify USDT received

## Smart Contracts

### TestSCR.sol
- Standard ERC20 token (18 decimals)
- Burnable
- Mintable for testing
- Faucet function

### TestUSDT.sol
- Standard ERC20 token (6 decimals like real USDT)
- Mintable for testing
- Faucet function

### SCRBurner.sol
- Accepts SCR tokens and burns them
- Transfers USDT at configurable rate
- Owner functions:
  - `setBurnRate(numerator, denominator)` - Update exchange rate
  - `fundUSDTPool(amount)` - Add USDT to pool
  - `withdrawUSDT(amount)` - Emergency withdraw
  - `pause()` / `unpause()` - Emergency controls

## Configuration

### Environment Variables

Create a `.env` file:

```env
# Contract addresses (from deployment)
VITE_SCR_TOKEN_ADDRESS=0x...
VITE_USDT_TOKEN_ADDRESS=0x...
VITE_BURNER_CONTRACT_ADDRESS=0x...

# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# For deployment (optional)
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_private_key
```

### Burn Rate

Default: 1 SCR = 0.03 USDT (3/100)

To change the rate, call `setBurnRate(numerator, denominator)` as contract owner:
```solidity
// Example: Set rate to 1 SCR = 0.05 USDT
burnerContract.setBurnRate(5, 100)
```

## Deployment to Polygon Mainnet

1. **Update hardhat.config.ts with Polygon settings**

2. **Set environment variables:**
   ```env
   POLYGON_RPC_URL=https://polygon-rpc.com
   PRIVATE_KEY=your_private_key
   ```

3. **Update contract addresses** in `deploy.ts` to use real SCR contract

4. **Deploy:**
   ```bash
   npx hardhat run scripts/deploy.ts --network polygon
   ```

5. **Update `.env`** with deployed addresses

6. **Build and deploy frontend:**
   ```bash
   npm run build
   # Deploy dist/ folder to hosting service
   ```

## Troubleshooting

### JoyID Compatibility
JoyID requires ethers v5 but we're using v6. Install with `--legacy-peer-deps`. JoyID may not work correctly - use MetaMask or WalletConnect instead.

### Module Errors
If you see module resolution errors, ensure TypeScript configs are correct and run:
```bash
npm run compile
```

### Transaction Fails
- Check you have enough SCR balance
- Check you have enough ETH/MATIC for gas
- Check the contract is not paused
- Check USDT pool has sufficient balance

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm test            # Run contract tests
npm run compile     # Compile contracts
npm run node        # Start local Hardhat network
```

## License

MIT

## Contributing

Pull requests are welcome! Please ensure tests pass before submitting.

---

**Built with ❤️ for SeeDAO**
