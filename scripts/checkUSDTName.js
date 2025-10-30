const hre = require("hardhat");

async function main() {
  const usdtAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const usdt = await hre.ethers.getContractAt("TestUSDT", usdtAddress);

  const name = await usdt.name();
  const symbol = await usdt.symbol();
  const decimals = await usdt.decimals();

  console.log("\n📝 Calling USDT Contract Methods:");
  console.log("Contract Address:", usdtAddress);
  console.log("\nname():", name);
  console.log("  Character count:", name.length);
  console.log("  Each character:");
  for (let i = 0; i < name.length; i++) {
    console.log(`    [${i}]: '${name[i]}' (char code: ${name.charCodeAt(i)})`);
  }

  console.log("\nsymbol():", symbol);
  console.log("decimals():", decimals);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
