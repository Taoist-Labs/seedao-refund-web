import hre from "hardhat";

/**
 * Script to grant BURNER_ROLE to SCRBurner contract on Polygon mainnet
 *
 * This script must be run by an account that has DEFAULT_ADMIN_ROLE on the SCR token.
 *
 * Prerequisites:
 * 1. SCRBurner contract must be deployed
 * 2. Set POLYGON_RPC_URL in .env
 * 3. Set PRIVATE_KEY in .env (must be admin of SCR token)
 * 4. Set BURNER_CONTRACT_ADDRESS environment variable or update the constant below
 *
 * Usage:
 * BURNER_CONTRACT_ADDRESS=0x... npx hardhat run scripts/grantBurnerRole.ts --network polygon
 */
async function main() {
  console.log("🔐 Starting BURNER_ROLE grant process...\n");

  const [admin] = await hre.ethers.getSigners();
  console.log("📝 Admin account:", admin.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(admin.address)), "MATIC\n");

  // Addresses
  const SCR_TOKEN_ADDRESS = "0xE4825A1a31a76f72befa47f7160B132AA03813E0";
  const BURNER_CONTRACT_ADDRESS = process.env.BURNER_CONTRACT_ADDRESS || "";

  if (!BURNER_CONTRACT_ADDRESS) {
    console.error("❌ Error: BURNER_CONTRACT_ADDRESS not set!");
    console.log("\nUsage:");
    console.log("BURNER_CONTRACT_ADDRESS=0x... npx hardhat run scripts/grantBurnerRole.ts --network polygon");
    process.exit(1);
  }

  console.log("📋 Contract addresses:");
  console.log("   SCR Token:      ", SCR_TOKEN_ADDRESS);
  console.log("   Burner Contract:", BURNER_CONTRACT_ADDRESS);

  // Get SCR token contract
  const scrToken = await hre.ethers.getContractAt("TestSCR", SCR_TOKEN_ADDRESS);

  // Calculate BURNER_ROLE
  const BURNER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("BURNER_ROLE"));
  console.log("\n📋 BURNER_ROLE hash:", BURNER_ROLE);

  // Check if admin has DEFAULT_ADMIN_ROLE
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const hasAdminRole = await scrToken.hasRole(DEFAULT_ADMIN_ROLE, admin.address);

  if (!hasAdminRole) {
    console.error("\n❌ Error: Your account does not have DEFAULT_ADMIN_ROLE on the SCR token!");
    console.log("   Your address:", admin.address);
    console.log("   SCR token:   ", SCR_TOKEN_ADDRESS);
    console.log("\n   Please use an account with admin privileges.");
    process.exit(1);
  }

  console.log("✅ Admin check passed");

  // Check if burner already has the role
  const hasRole = await scrToken.hasRole(BURNER_ROLE, BURNER_CONTRACT_ADDRESS);

  if (hasRole) {
    console.log("\n⚠️  Burner contract already has BURNER_ROLE!");
    console.log("   No action needed.");
    return;
  }

  // Grant BURNER_ROLE
  console.log("\n🔄 Granting BURNER_ROLE to burner contract...");
  const tx = await scrToken.grantRole(BURNER_ROLE, BURNER_CONTRACT_ADDRESS);
  console.log("   Transaction hash:", tx.hash);
  console.log("   Waiting for confirmation...");

  const receipt = await tx.wait();

  if (receipt && receipt.status === 1) {
    console.log("✅ Transaction confirmed!");
    console.log("   Block number:", receipt.blockNumber);
    console.log("   Gas used:", receipt.gasUsed.toString());

    // Verify the role was granted
    const verified = await scrToken.hasRole(BURNER_ROLE, BURNER_CONTRACT_ADDRESS);

    if (verified) {
      console.log("\n" + "=".repeat(60));
      console.log("✅ SUCCESS: BURNER_ROLE granted successfully!");
      console.log("=".repeat(60));
      console.log("SCR Token:       ", SCR_TOKEN_ADDRESS);
      console.log("Burner Contract: ", BURNER_CONTRACT_ADDRESS);
      console.log("Transaction:     ", tx.hash);
      console.log("=".repeat(60));
    } else {
      console.error("\n❌ Error: Role verification failed!");
    }
  } else {
    console.error("\n❌ Error: Transaction failed!");
    process.exit(1);
  }

  console.log("\n✨ Process complete!\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
