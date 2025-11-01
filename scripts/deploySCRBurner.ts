import hre from "hardhat";
import { MetamaskConnector } from "@web3camp/hardhat-metamask-connector";

/**
 * Deploy upgradeable SCRBurner contract
 *
 * This script deploys the SCRBurnerUpgradeable contract with UUPS proxy.
 * It requires existing SCR and USDT token addresses.
 *
 * For local development, run deployTestTokens.ts first to deploy test tokens.
 * For mainnet, use the existing token addresses.
 *
 * Usage:
 * Local:   SCR_TOKEN=0x... USDT_TOKEN=0x... npx hardhat run scripts/deploySCRBurner.ts --network localhost
 *          (or use default addresses for localhost)
 * Testnet: SCR_TOKEN=0x... USDT_TOKEN=0x... npx hardhat run scripts/deploySCRBurner.ts --network <testnet>
 */
async function main() {
  const upgrades = (hre as any).upgrades;
  const connector = new MetamaskConnector();

  // Detect network
  const networkName = hre.network.name;
  const isLocalhost = networkName === "localhost" || networkName === "hardhat";

  console.log(`🚀 Deploying SCRBurnerUpgradeable to ${networkName}...\n`);

  // const [deployer] = await hre.ethers.getSigners();
  const deployer = await connector.getSigner();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), isLocalhost ? "ETH" : "MATIC", "\n");

  // Get token addresses from environment or use defaults for localhost
  const scrAddress = process.env.SCR_TOKEN || (isLocalhost ? "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318" : "");
  const usdtAddress = process.env.USDT_TOKEN || (isLocalhost ? "0x610178dA211FEF7D417bC0e6FeD39F05609AD788" : "");

  if (!scrAddress || !usdtAddress) {
    console.error("❌ Error: Token addresses not provided!");
    console.log("\nUsage:");
    console.log("SCR_TOKEN=0x... USDT_TOKEN=0x... npx hardhat run scripts/deploySCRBurner.ts --network", networkName);
    console.log("\nFor localhost, you can run deployTestTokens.ts first to get addresses.");
    process.exit(1);
  }

  console.log("📋 Using token addresses:");
  console.log("   SCR Token:  ", scrAddress);
  console.log("   USDT Token: ", usdtAddress);

  // Initial burn rate: 1 SCR = 0.03 USDT (3/100)
  const RATE_NUMERATOR = 3;
  const RATE_DENOMINATOR = 100;

  console.log("\n📋 Burn rate configuration:");
  console.log("   1 SCR =", RATE_NUMERATOR, "/", RATE_DENOMINATOR, "USDT");
  console.log("   1 SCR =", (RATE_NUMERATOR / RATE_DENOMINATOR).toFixed(2), "USDT\n");

  // Deploy SCRBurnerUpgradeable with UUPS proxy
  console.log("📦 Deploying SCRBurnerUpgradeable (with UUPS proxy)...");
  const SCRBurnerFactory = await hre.ethers.getContractFactory("SCRBurnerUpgradeable");

  const burnerContract = await upgrades.deployProxy(
    SCRBurnerFactory,
    [
      scrAddress,        // _scrToken
      usdtAddress,       // _usdtToken
      RATE_NUMERATOR,    // _rateNumerator
      RATE_DENOMINATOR   // _rateDenominator
    ],
    {
      kind: 'uups',
      initializer: 'initialize',
      signer:deployer
    }
  );

  await burnerContract.waitForDeployment();
  const burnerAddress = await burnerContract.getAddress();

  // Get implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(burnerAddress);

  console.log("✅ SCRBurnerUpgradeable Proxy deployed to:", burnerAddress);
  console.log("✅ Implementation address:", implementationAddress);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:              ", networkName);
  console.log("SCR Token:            ", scrAddress);
  console.log("USDT Token:           ", usdtAddress);
  console.log("SCRBurner (Proxy):    ", burnerAddress);
  console.log("Implementation:       ", implementationAddress);
  console.log("=".repeat(60));

  console.log("\n📝 Update your frontend config with:");
  console.log("burner: '" + burnerAddress + "',");

  console.log("\n💡 The proxy address is what users interact with.");
  console.log("💡 Implementation can be upgraded without changing proxy address.");
  console.log("\n✨ Deployment complete!\n");


  console.log("\n💡 Remember to grant BURNER_ROLE of SCR token to the burner contract!")
  console.log("\n💡 Remember to fund the burner contract with USDT!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

