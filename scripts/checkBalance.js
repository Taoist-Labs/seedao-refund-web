const hre = require("hardhat");

async function main() {
  const userAddress = "0x5b98db836629513511377F127376A70ddB3A774E";
  const scrAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const usdtAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const scr = await hre.ethers.getContractAt("TestSCR", scrAddress);
  const usdt = await hre.ethers.getContractAt("TestUSDT", usdtAddress);

  const scrBalance = await scr.balanceOf(userAddress);
  const usdtBalance = await usdt.balanceOf(userAddress);

  const scrName = await scr.name();
  const scrSymbol = await scr.symbol();
  const usdtName = await usdt.name();
  const usdtSymbol = await usdt.symbol();

  console.log("\n📊 Token Info:");
  console.log("SCR Token:");
  console.log("  Name:", scrName, `(${scrName.length} chars)`);
  console.log("  Symbol:", scrSymbol);
  console.log("  Address:", scrAddress);

  console.log("\nUSDT Token:");
  console.log("  Name:", usdtName, `(${usdtName.length} chars)`);
  console.log("  Symbol:", usdtSymbol);
  console.log("  Address:", usdtAddress);

  console.log("\n💰 Your Balances for", userAddress);
  console.log("  SCR:", hre.ethers.formatEther(scrBalance));
  console.log("  USDT:", hre.ethers.formatUnits(usdtBalance, 6));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
