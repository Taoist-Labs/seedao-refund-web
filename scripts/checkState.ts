import hre from "hardhat";

/**
 * Check SCRBurner contract state
 *
 * This script reads and displays all the stored state of the SCRBurner contract.
 * Use this to verify state before and after upgrades.
 *
 * Usage:
 * Local:   PROXY_ADDRESS=0x... npx hardhat run scripts/checkState.ts --network localhost
 * Polygon: PROXY_ADDRESS=0x... npx hardhat run scripts/checkState.ts --network polygon
 */

async function main() {
  const networkName = hre.network.name;
  const isLocalhost = networkName === "localhost" || networkName === "hardhat";
  const currencySymbol = isLocalhost ? "ETH" : "MATIC";

  console.log(`🔍 Checking SCRBurner state on ${networkName}...\n`);

  const [signer] = await hre.ethers.getSigners();
  console.log("📝 Using account:", signer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(signer.address))} ${currencySymbol}\n`);

  // Get proxy address
  const PROXY_ADDRESS = process.env.PROXY_ADDRESS ||
    (isLocalhost ? "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0" : "");

  if (!PROXY_ADDRESS) {
    console.error("❌ Error: PROXY_ADDRESS not set!");
    console.log("\nUsage:");
    console.log(`PROXY_ADDRESS=0x... npx hardhat run scripts/checkState.ts --network ${networkName}`);
    process.exit(1);
  }

  console.log("📋 Proxy address:", PROXY_ADDRESS);
  console.log("");

  // Get the contract
  const burnerContract = await hre.ethers.getContractAt("SCRBurnerUpgradeable", PROXY_ADDRESS);

  // Read all state variables
  console.log("=" .repeat(70));
  console.log("📊 CONTRACT STATE");
  console.log("=".repeat(70));

  try {
    // 1. Token addresses
    const scrTokenAddress = await burnerContract.scrToken();
    const usdtTokenAddress = await burnerContract.usdtToken();
    console.log("\n🪙 Token Addresses:");
    console.log("   SCR Token:  ", scrTokenAddress);
    console.log("   USDT Token: ", usdtTokenAddress);

    // 2. Burn rate
    const [numerator, denominator] = await burnerContract.getCurrentRate();
    const rateDecimal = Number(numerator) / Number(denominator);
    console.log("\n💱 Burn Rate:");
    console.log("   Numerator:   ", numerator.toString());
    console.log("   Denominator: ", denominator.toString());
    console.log("   Rate:         1 SCR = " + rateDecimal.toFixed(4) + " USDT");

    // 3. Pool balances
    const usdtPoolBalance = await burnerContract.getUSDTPoolBalance();
    const scrBalance = await burnerContract.getSCRBalance();
    console.log("\n💰 Token Balances:");
    console.log("   USDT Pool:  ", hre.ethers.formatUnits(usdtPoolBalance, 6), "USDT");
    console.log("   SCR Balance:", hre.ethers.formatEther(scrBalance), "SCR");

    // 4. Owner
    const owner = await burnerContract.owner();
    console.log("\n👤 Contract Owner:");
    console.log("   Owner:      ", owner);
    console.log("   Is you?     ", owner.toLowerCase() === signer.address.toLowerCase() ? "✅ Yes" : "❌ No");

    // 5. Paused state
    const isPaused = await burnerContract.paused();
    console.log("\n⏸️  Pause State:");
    console.log("   Paused?     ", isPaused ? "⚠️  Yes (contract is paused)" : "✅ No (contract is active)");

    // 6. Get implementation address (via upgrades plugin)
    console.log("\n🔧 Upgrade Info:");
    const upgrades = (hre as any).upgrades;
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    console.log("   Implementation:", implementationAddress);

    console.log("\n" + "=".repeat(70));

    // Calculate example burn amount
    console.log("\n💡 Example Burn Transaction:");
    const exampleSCR = hre.ethers.parseEther("100"); // 100 SCR
    const exampleUSDT = await burnerContract.calculateUSDTAmount(exampleSCR);
    console.log("   Burn 100 SCR → Receive", hre.ethers.formatUnits(exampleUSDT, 6), "USDT");

    // Check if pool has enough USDT
    if (usdtPoolBalance < exampleUSDT) {
      console.log("   ⚠️  Warning: USDT pool has insufficient balance for this burn!");
    } else {
      console.log("   ✅ Pool has sufficient USDT for this burn");
    }

    console.log("\n✨ State check complete!\n");

  } catch (error: any) {
    console.error("\n❌ Error reading contract state:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
