import hre from "hardhat";

/**
 * Script to upgrade the SCRBurner contract
 *
 * Usage:
 * 1. Deploy new implementation with fixes/features
 * 2. Run this script to upgrade the proxy to point to new implementation
 * 3. Existing proxy address remains the same, so no frontend changes needed
 *
 * Example:
 * npx hardhat run scripts/upgrade.ts --network localhost
 */
async function main() {
  const upgrades = (hre as any).upgrades;
  // The address of the existing proxy contract
  const PROXY_ADDRESS = process.env.PROXY_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  console.log("🔄 Starting upgrade process...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Upgrading with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  console.log("📋 Current proxy address:", PROXY_ADDRESS);

  // Get current implementation address
  const currentImplementation = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  console.log("📋 Current implementation:", currentImplementation);

  // Deploy new implementation
  console.log("\n📦 Deploying new implementation...");
  const SCRBurnerV2Factory = await hre.ethers.getContractFactory("SCRBurnerUpgradeable");

  // Upgrade to new implementation
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, SCRBurnerV2Factory, {
    kind: 'uups'
  });

  await upgraded.waitForDeployment();

  // Get new implementation address
  const newImplementation = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);

  console.log("\n" + "=".repeat(60));
  console.log("📋 UPGRADE SUMMARY");
  console.log("=".repeat(60));
  console.log("Proxy address (unchanged):  ", PROXY_ADDRESS);
  console.log("Old implementation:         ", currentImplementation);
  console.log("New implementation:         ", newImplementation);
  console.log("=".repeat(60));

  console.log("\n✅ Upgrade successful!");
  console.log("💡 The proxy address remains the same - no frontend changes needed.");
  console.log("💡 All existing data and state is preserved.\n");

  // Verify the upgrade by checking the version or new functionality
  console.log("🔍 Verifying upgrade...");
  const contract = await hre.ethers.getContractAt("SCRBurnerUpgradeable", PROXY_ADDRESS);
  const [numerator, denominator] = await contract.getCurrentRate();
  console.log("✅ Contract is responsive. Current rate:", numerator.toString(), "/", denominator.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
