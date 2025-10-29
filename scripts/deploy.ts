import hre from "hardhat";

async function main() {
  console.log("🚀 Starting deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
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

  // Deploy SCRBurner with initial rate 3/100 = 0.03
  console.log("\n📦 Deploying SCRBurner...");
  const SCRBurnerFactory = await hre.ethers.getContractFactory("SCRBurner");
  const burnerContract = await SCRBurnerFactory.deploy(
    scrAddress,
    usdtAddress,
    3, // numerator
    100 // denominator
  );
  await burnerContract.waitForDeployment();
  const burnerAddress = await burnerContract.getAddress();
  console.log("✅ SCRBurner deployed to:", burnerAddress);

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
  console.log("TestSCR:      ", scrAddress);
  console.log("TestUSDT:     ", usdtAddress);
  console.log("SCRBurner:    ", burnerAddress);
  console.log("=".repeat(60));
  console.log("\n📝 Update your .env file with these addresses:");
  console.log(`VITE_SCR_TOKEN_ADDRESS=${scrAddress}`);
  console.log(`VITE_USDT_TOKEN_ADDRESS=${usdtAddress}`);
  console.log(`VITE_BURNER_CONTRACT_ADDRESS=${burnerAddress}`);
  console.log("\n✨ Deployment complete!\n");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
