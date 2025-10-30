# SCR Token Burner

Burn SCR tokens and receive USDT at a configurable exchange rate.

## Quick Start (Local Development)

```bash
# Install dependencies
npm install --legacy-peer-deps

# Compile contracts
npm run compile

# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy test tokens and burner contract
npx hardhat run scripts/deployTestTokens.ts --network localhost
npx hardhat run scripts/deploySCRBurner.ts --network localhost

# Terminal 2: Send test assets to your wallet
npx hardhat run scripts/sendTokens.ts --network localhost

# Terminal 3: Start frontend
cd frontend && npm run dev
```

**Configure MetaMask:**
- Network: Hardhat Local
- RPC: http://127.0.0.1:8545
- Chain ID: 1337

**Visit:** http://localhost:3000

## Tech Stack

**Frontend:** Vue 3, TypeScript, Vite, Wagmi, Tailwind CSS
**Contracts:** Solidity 0.8.22, Hardhat, OpenZeppelin Upgradeable, TypeChain

## Contracts

**SCRBurnerUpgradeable** - Upgradeable contract (UUPS proxy) for burning SCR tokens
- Default rate: 1 SCR = 0.03 USDT
- Owner can update rate, fund pool, pause/unpause, and upgrade implementation
- Proxy pattern allows contract upgrades without changing address

**TestSCR** - ERC20 (18 decimals) with burnable tokens for local testing
**TestUSDT** - ERC20 (6 decimals) for local testing

## Deployment Scripts

### Local Development
```bash
# Deploy test tokens (TestSCR and TestUSDT)
npx hardhat run scripts/deployTestTokens.ts --network localhost

# Deploy upgradeable burner contract
npx hardhat run scripts/deploySCRBurner.ts --network localhost

# Send test assets (ETH, SCR, USDT) to your wallet
npx hardhat run scripts/sendTokens.ts --network localhost

# Upgrade burner contract (optional)
PROXY_ADDRESS=0x... npx hardhat run scripts/upgrade.ts --network localhost
```

### Polygon Mainnet
```bash
# Deploy upgradeable burner contract
SCR_TOKEN=0xE4825A1a31a76f72befa47f7160B132AA03813E0 \
USDT_TOKEN=0xc2132D05D31c914a87C6611C10748AEb04B58e8F \
npx hardhat run scripts/deploySCRBurner.ts --network polygon

# Grant BURNER_ROLE to deployed contract
BURNER_CONTRACT_ADDRESS=0x... npx hardhat run scripts/grantBurnerRole.ts --network polygon

# Upgrade burner contract
PROXY_ADDRESS=0x... npx hardhat run scripts/upgrade.ts --network polygon
```

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
  scrToken: '0x...',    // SCR token address
  usdtToken: '0x...',   // USDT token address
  burner: '0x...',      // SCRBurner PROXY address (not implementation)
}
```

**Important:** Always use the **proxy address** for the burner contract, not the implementation address.

## Project Structure

```
├── contracts/              # Smart contracts
│   ├── SCRBurnerUpgradeable.sol  # Main burner contract (upgradeable)
│   ├── TestSCR.sol        # Test SCR token
│   └── TestUSDT.sol       # Test USDT token
├── scripts/               # Deployment scripts
│   ├── deployTestTokens.ts      # Deploy test tokens (local only)
│   ├── deploySCRBurner.ts       # Deploy burner (universal)
│   ├── grantBurnerRole.ts       # Grant BURNER_ROLE (mainnet)
│   ├── sendTokens.ts            # Send test assets (local only)
│   └── upgrade.ts               # Upgrade burner (universal)
├── frontend/              # Vue 3 frontend
│   └── src/
│       ├── config.ts      # Contract addresses & network config
│       └── ...
```

## License

MIT

---

Built by [Taoist Labs](https://github.com/taoist-labs)
