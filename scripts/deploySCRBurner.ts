import hre from "hardhat";

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

  // Detect network
  const networkName = hre.network.name;
  const isLocalhost = networkName === "localhost" || networkName === "hardhat";

  console.log(`🚀 Deploying SCRBurnerUpgradeable to ${networkName}...\n`);

  const [deployer] = await hre.ethers.getSigners();
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
      initializer: 'initialize'
    }
  );

  await burnerContract.waitForDeployment();
  const burnerAddress = await burnerContract.getAddress();

  // Get implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(burnerAddress);

  console.log("✅ SCRBurnerUpgradeable Proxy deployed to:", burnerAddress);
  console.log("✅ Implementation address:", implementationAddress);

  // Grant BURNER_ROLE to SCRBurner contract (if deployer has admin role)
  console.log("\n🔐 Granting BURNER_ROLE to SCRBurner...");
  const BURNER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("BURNER_ROLE"));

  try {
    const scrToken = await hre.ethers.getContractAt("TestSCR", scrAddress);
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const hasAdminRole = await scrToken.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);

    if (hasAdminRole) {
      await scrToken.grantRole(BURNER_ROLE, burnerAddress);
      console.log("✅ BURNER_ROLE granted to SCRBurner");
    } else {
      console.log("⚠️  Skipping BURNER_ROLE grant - deployer is not admin of SCR token");
      console.log("   Run grantBurnerRole.ts script with admin account");
    }
  } catch (error) {
    console.log("⚠️  Could not grant BURNER_ROLE - run grantBurnerRole.ts script manually");
  }

  // Fund the burner contract with USDT (if available)
  if (isLocalhost) {
    console.log("\n💵 Funding SCRBurner with USDT...");
    try {
      const usdtToken = await hre.ethers.getContractAt("TestUSDT", usdtAddress);
      const fundAmount = hre.ethers.parseUnits("10000", 6); // 10,000 USDT
      await usdtToken.approve(burnerAddress, fundAmount);
      await burnerContract.fundUSDTPool(fundAmount);
      console.log("✅ Funded with", hre.ethers.formatUnits(fundAmount, 6), "USDT");
    } catch (error) {
      console.log("⚠️  Could not fund USDT pool - do it manually later");
    }
  } else {
    console.log("\n💡 Remember to fund the burner contract with USDT!");
  }

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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

