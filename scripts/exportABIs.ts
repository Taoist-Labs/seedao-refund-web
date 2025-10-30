import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Export contract ABIs to frontend
 *
 * This script copies the necessary ABI files from artifacts/ to frontend/src/abis/
 * so they can be committed to git and used by the frontend.
 *
 * The exported ABIs work for both test tokens (localhost) and production tokens (mainnet):
 * - ERC20.json: Standard ERC20 interface used by both TestSCR/ScoreV4 and TestUSDT/USDT
 * - SCRBurnerUpgradeable.json: The burner contract interface
 *
 * Usage: npx hardhat run scripts/exportABIs.ts
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ContractArtifact {
  abi: any[];
  contractName: string;
}

async function main() {
  console.log("📦 Exporting contract ABIs to frontend...\n");

  const outputDir = path.join(__dirname, '../frontend/src/abis');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Contracts to export
  const contracts = [
    {
      name: 'ERC20',
      path: 'artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json',
      description: 'Standard ERC20 interface (for SCR and USDT tokens)'
    },
    {
      name: 'SCRBurnerUpgradeable',
      path: 'artifacts/contracts/SCRBurnerUpgradeable.sol/SCRBurnerUpgradeable.json',
      description: 'Upgradeable burner contract'
    }
  ];

  let successCount = 0;

  for (const contract of contracts) {
    const artifactPath = path.join(__dirname, '..', contract.path);

    if (!fs.existsSync(artifactPath)) {
      console.log(`⚠️  ${contract.name}: Artifact not found at ${contract.path}`);
      console.log(`   Run 'npm run compile' first to generate artifacts.\n`);
      continue;
    }

    // Read the full artifact
    const artifact: ContractArtifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

    // Extract only the ABI
    const abiData = {
      contractName: contract.name,
      abi: artifact.abi
    };

    // Write to frontend/src/abis/
    const outputPath = path.join(outputDir, `${contract.name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(abiData, null, 2));

    console.log(`✅ ${contract.name}: ${contract.description}`);
    console.log(`   Exported to frontend/src/abis/${contract.name}.json\n`);
    successCount++;
  }

  console.log(`📊 Exported ${successCount}/${contracts.length} contract ABIs`);

  if (successCount === contracts.length) {
    console.log("\n✨ All ABIs exported successfully!");
    console.log("💡 These ABIs work for both test (localhost) and production (mainnet) tokens.\n");
  } else {
    console.log("\n⚠️  Some ABIs were not exported. Make sure to run 'npm run compile' first.\n");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
