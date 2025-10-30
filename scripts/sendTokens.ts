import hre from "hardhat";

async function main() {
  const recipientAddress = "0x5b98db836629513511377F127376A70ddB3A774E";

  console.log("🎁 Sending test assets to:", recipientAddress);
  console.log("");

  const [sender] = await hre.ethers.getSigners();

  // Send 100 ETH
  console.log("📤 Sending 100 ETH...");
  const ethAmount = hre.ethers.parseEther("100");
  const ethTx = await sender.sendTransaction({
    to: recipientAddress,
    value: ethAmount
  });
  await ethTx.wait();
  console.log("✅ 100 ETH sent!");

  // Get contract addresses
  const scrAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
  const usdtAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";

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

  // Check all balances
  const ethBalance = await hre.ethers.provider.getBalance(recipientAddress);
  const scrBalance = await scr.balanceOf(recipientAddress);
  const usdtBalance = await usdt.balanceOf(recipientAddress);

  console.log("\n💰 Your balances:");
  console.log("  ETH:  ", hre.ethers.formatEther(ethBalance));
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

