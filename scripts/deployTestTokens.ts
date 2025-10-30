import hre from "hardhat";

/**
 * Deploy test tokens (TestSCR and TestUSDT) for local development
 *
 * This script is only for local testing. On mainnet, use existing tokens.
 *
 * Usage:
 * npx hardhat run scripts/deployTestTokens.ts --network localhost
 */
async function main() {
  console.log("🚀 Deploying test tokens...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy TestSCR
  console.log("📦 Deploying TestSCR...");
  const TestSCRFactory = await hre.ethers.getContractFactory("TestSCR");
  const scrToken = await TestSCRFactory.deploy();
  await scrToken.waitForDeployment();
  const scrAddress = await scrToken.getAddress();
  console.log("✅ TestSCR deployed to:", scrAddress);

  // Deploy TestUSDT
  console.log("\n📦 Deploying TestUSDT...");
  const TestUSDTFactory = await hre.ethers.getContractFactory("TestUSDT");
  const usdtToken = await TestUSDTFactory.deploy();
  await usdtToken.waitForDeployment();
  const usdtAddress = await usdtToken.getAddress();
  console.log("✅ TestUSDT deployed to:", usdtAddress);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 TEST TOKENS DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("TestSCR:      ", scrAddress);
  console.log("TestUSDT:     ", usdtAddress);
  console.log("=".repeat(60));

  console.log("\n📝 Next steps:");
  console.log("1. Deploy SCRBurner: npx hardhat run scripts/deploySCRBurner.ts --network localhost");
  console.log("   (or set SCR_TOKEN and USDT_TOKEN env vars with these addresses)");

  console.log("\n✨ Test tokens deployed!\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
