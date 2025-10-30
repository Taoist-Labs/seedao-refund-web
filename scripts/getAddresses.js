const hre = require("hardhat");

async function main() {
  const scrAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const usdtAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const burnerAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  console.log("\n✅ Correct Contract Addresses (with checksum):");
  console.log("\nSCR Token:");
  console.log("  ", hre.ethers.getAddress(scrAddress));
  console.log("\nUSDT Token:");
  console.log("  ", hre.ethers.getAddress(usdtAddress));
  console.log("\nSCRBurner Contract:");
  console.log("  ", hre.ethers.getAddress(burnerAddress));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
