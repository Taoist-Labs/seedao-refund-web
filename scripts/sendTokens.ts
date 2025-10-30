import hre from "hardhat";

async function main() {
  const recipientAddress = "0x5b98db836629513511377F127376A70ddB3A774E";

  console.log("🎁 Sending test tokens to:", recipientAddress);

  const scrAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const usdtAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const scr = await hre.ethers.getContractAt("TestSCR", scrAddress);
  const usdt = await hre.ethers.getContractAt("TestUSDT", usdtAddress);

  // Send 10,000 SCR
  console.log("\n📤 Sending 10,000 SCR...");
  const scrAmount = hre.ethers.parseEther("10000");
  const scrTx = await scr.transfer(recipientAddress, scrAmount);
  await scrTx.wait();
  console.log("✅ 10,000 SCR sent!");

  // Send 500 USDT (so you can see balance increase after burning)
  console.log("\n📤 Sending 500 USDT...");
  const usdtAmount = hre.ethers.parseUnits("500", 6);
  const usdtTx = await usdt.transfer(recipientAddress, usdtAmount);
  await usdtTx.wait();
  console.log("✅ 500 USDT sent!");

  // Check balances
  const scrBalance = await scr.balanceOf(recipientAddress);
  const usdtBalance = await usdt.balanceOf(recipientAddress);

  console.log("\n💰 Your balances:");
  console.log("  SCR:  ", hre.ethers.formatEther(scrBalance));
  console.log("  USDT: ", hre.ethers.formatUnits(usdtBalance, 6));

  console.log("\n✨ All done! You're ready to test the burn feature!");
  console.log("\n🔥 Try burning some SCR at http://localhost:3000");
  console.log("   Example: Burn 100 SCR → Receive 3 USDT");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
