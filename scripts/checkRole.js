const hre = require("hardhat");

async function main() {
  const scrAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const burnerAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  const scr = await hre.ethers.getContractAt("TestSCR", scrAddress);

  const BURNER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("BURNER_ROLE"));

  const hasBurnerRole = await scr.hasRole(BURNER_ROLE, burnerAddress);

  console.log("\n🔐 Role Check:");
  console.log("BURNER_ROLE:", BURNER_ROLE);
  console.log("SCRBurner address:", burnerAddress);
  console.log("Has BURNER_ROLE:", hasBurnerRole);

  if (!hasBurnerRole) {
    console.log("\n❌ SCRBurner does NOT have BURNER_ROLE!");
    console.log("This means the SCRBurner contract cannot actually burn SCR tokens.");
  } else {
    console.log("\n✅ SCRBurner has BURNER_ROLE - all good!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
