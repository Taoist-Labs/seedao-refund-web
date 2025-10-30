const hre = require("hardhat");
const { formatEther, parseEther } = require("ethers");

async function main() {
  const recipientAddress = "0x5b98db836629513511377F127376A70ddB3A774E";
  const amountToSend = "100"; // 100 ETH

  // Get the first default signer (has lots of ETH on local network)
  const [sender] = await hre.ethers.getSigners();

  console.log("Sending ETH...");
  console.log("From:", sender.address);
  console.log("To:", recipientAddress);
  console.log("Amount:", amountToSend, "ETH");
  console.log("");

  // Check sender balance before
  const senderBalanceBefore = await hre.ethers.provider.getBalance(sender.address);
  console.log("Sender balance before:", formatEther(senderBalanceBefore), "ETH");

  // Check recipient balance before
  const recipientBalanceBefore = await hre.ethers.provider.getBalance(recipientAddress);
  console.log("Recipient balance before:", formatEther(recipientBalanceBefore), "ETH");
  console.log("");

  // Send ETH
  const tx = await sender.sendTransaction({
    to: recipientAddress,
    value: parseEther(amountToSend)
  });

  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for confirmation...");

  await tx.wait();

  console.log("Transaction confirmed!");
  console.log("");

  // Check balances after
  const recipientBalanceAfter = await hre.ethers.provider.getBalance(recipientAddress);
  console.log("Recipient balance after:", formatEther(recipientBalanceAfter), "ETH");
  console.log("Received:", formatEther(recipientBalanceAfter - recipientBalanceBefore), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
