import hre from "hardhat";

async function main() {
  const upgrades = (hre as any).upgrades;
  console.log("🚀 Starting upgradeable deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy TestSCR (non-upgradeable test token)
  console.log("📦 Deploying TestSCR...");
  const TestSCRFactory = await hre.ethers.getContractFactory("TestSCR");
  const scrToken = await TestSCRFactory.deploy();
  await scrToken.waitForDeployment();
  const scrAddress = await scrToken.getAddress();
  console.log("✅ TestSCR deployed to:", scrAddress);

  // Deploy TestUSDT (non-upgradeable test token)
  console.log("\n📦 Deploying TestUSDT...");
  const TestUSDTFactory = await hre.ethers.getContractFactory("TestUSDT");
  const usdtToken = await TestUSDTFactory.deploy();
  await usdtToken.waitForDeployment();
  const usdtAddress = await usdtToken.getAddress();
  console.log("✅ TestUSDT deployed to:", usdtAddress);

  // Deploy SCRBurnerUpgradeable with UUPS proxy
  console.log("\n📦 Deploying SCRBurnerUpgradeable (with proxy)...");
  const SCRBurnerFactory = await hre.ethers.getContractFactory("SCRBurnerUpgradeable");

  const burnerContract = await upgrades.deployProxy(
    SCRBurnerFactory,
    [
      scrAddress,     // _scrToken
      usdtAddress,    // _usdtToken
      3,              // _rateNumerator
      100             // _rateDenominator
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

  // Grant BURNER_ROLE to SCRBurner contract
  console.log("\n🔐 Granting BURNER_ROLE to SCRBurner...");
  const BURNER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("BURNER_ROLE"));
  await scrToken.grantRole(BURNER_ROLE, burnerAddress);
  console.log("✅ BURNER_ROLE granted to SCRBurner");

  // Fund the burner contract with USDT
  console.log("\n💵 Funding SCRBurner with USDT...");
  const fundAmount = hre.ethers.parseUnits("10000", 6); // 10,000 USDT
  await usdtToken.approve(burnerAddress, fundAmount);
  await burnerContract.fundUSDTPool(fundAmount);
  console.log("✅ Funded with", hre.ethers.formatUnits(fundAmount, 6), "USDT");

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("TestSCR:              ", scrAddress);
  console.log("TestUSDT:             ", usdtAddress);
  console.log("SCRBurner (Proxy):    ", burnerAddress);
  console.log("Implementation:       ", implementationAddress);
  console.log("=".repeat(60));
  console.log("\n📝 Update your frontend config with these addresses:");
  console.log(`VITE_SCR_TOKEN_ADDRESS=${scrAddress}`);
  console.log(`VITE_USDT_TOKEN_ADDRESS=${usdtAddress}`);
  console.log(`VITE_BURNER_CONTRACT_ADDRESS=${burnerAddress}`);
  console.log("\n💡 The proxy address is what users interact with.");
  console.log("💡 Implementation can be upgraded without changing proxy address.");
  console.log("\n✨ Deployment complete!\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
