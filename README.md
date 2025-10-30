# SCR Token Burner

Burn SCR tokens and receive USDT at a configurable exchange rate.

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Compile contracts
npm run compile

# Start local node (terminal 1)
npm run node

# Deploy contracts (terminal 2)
npx hardhat run scripts/deploy.ts --network localhost

# Start frontend
cd frontend && npm run dev
```

**Configure MetaMask:**
- Network: Hardhat Local
- RPC: http://127.0.0.1:8545
- Chain ID: 1337

**Visit:** http://localhost:3000

## Tech Stack

**Frontend:** Vue 3, TypeScript, Vite, Wagmi, Tailwind CSS
**Contracts:** Solidity 0.8.20, Hardhat, OpenZeppelin, TypeChain

## Contracts

**SCRBurner** - Main contract accepting SCR and distributing USDT
- Default rate: 1 SCR = 0.03 USDT
- Owner can update rate, fund pool, pause/unpause

**TestSCR** - ERC20 (18 decimals) for testing
**TestUSDT** - ERC20 (6 decimals) for testing

## Key Commands

```bash
npm run node         # Start Hardhat network
npm run compile      # Compile contracts
npm test             # Run tests
npm run dev          # Start frontend (from frontend/)
npm run build        # Build frontend
```

## Configuration

Contract addresses are in `frontend/src/config.ts` (not environment variables).

Update after deployment:
```typescript
contracts: {
  scrToken: '0x...',
  usdtToken: '0x...',
  burner: '0x...',
}
```

## License

MIT
