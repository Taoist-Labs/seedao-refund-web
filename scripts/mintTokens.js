const hre = require("hardhat");

async function main() {
  const recipient = process.env.RECIPIENT || "0x5b98db836629513511377F127376A70ddB3A774E";
  const scrAmount = hre.ethers.parseUnits("10000", 18); // 10,000 SCR
  const usdtAmount = hre.ethers.parseUnits("10000", 6); // 10,000 USDT

  // Get deployed contract addresses from config
  const scrAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const usdtAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  // Get contract instances
  const TestSCR = await hre.ethers.getContractAt("TestSCR", scrAddress);
  const TestUSDT = await hre.ethers.getContractAt("TestUSDT", usdtAddress);

  console.log(`\nMinting tokens to ${recipient}...`);
  console.log(`SCR Amount: ${hre.ethers.formatUnits(scrAmount, 18)}`);
  console.log(`USDT Amount: ${hre.ethers.formatUnits(usdtAmount, 6)}`);

  // Mint SCR tokens
  const tx1 = await TestSCR.mint(recipient, scrAmount);
  await tx1.wait();
  console.log(`✅ Minted SCR tokens. Tx: ${tx1.hash}`);

  // Mint USDT tokens
  const tx2 = await TestUSDT.mint(recipient, usdtAmount);
  await tx2.wait();
  console.log(`✅ Minted USDT tokens. Tx: ${tx2.hash}`);

  // Check balances
  const scrBalance = await TestSCR.balanceOf(recipient);
  const usdtBalance = await TestUSDT.balanceOf(recipient);

  console.log(`\n📊 Final Balances:`);
  console.log(`SCR:  ${hre.ethers.formatUnits(scrBalance, 18)}`);
  console.log(`USDT: ${hre.ethers.formatUnits(usdtBalance, 6)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
