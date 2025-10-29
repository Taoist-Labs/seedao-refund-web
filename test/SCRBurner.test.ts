import { expect } from "chai";
import hre from "hardhat";
import { TestSCR, TestUSDT, SCRBurner } from "../src/types/contracts";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

const { ethers } = hre;

describe("SCRBurner", function () {
  let scrToken: TestSCR;
  let usdtToken: TestUSDT;
  let burnerContract: SCRBurner;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const INITIAL_RATE_NUMERATOR = 3n;
  const INITIAL_RATE_DENOMINATOR = 100n;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy test tokens
    const TestSCRFactory = await ethers.getContractFactory("TestSCR");
    scrToken = await TestSCRFactory.deploy();
    await scrToken.waitForDeployment();

    const TestUSDTFactory = await ethers.getContractFactory("TestUSDT");
    usdtToken = await TestUSDTFactory.deploy();
    await usdtToken.waitForDeployment();

    // Deploy burner contract
    const SCRBurnerFactory = await ethers.getContractFactory("SCRBurner");
    burnerContract = await SCRBurnerFactory.deploy(
      await scrToken.getAddress(),
      await usdtToken.getAddress(),
      INITIAL_RATE_NUMERATOR,
      INITIAL_RATE_DENOMINATOR
    );
    await burnerContract.waitForDeployment();

    // Fund burner contract with USDT
    const fundAmount = ethers.parseUnits("10000", 6); // 10,000 USDT
    await usdtToken.approve(await burnerContract.getAddress(), fundAmount);
    await burnerContract.fundUSDTPool(fundAmount);

    // Give users some SCR tokens
    const scrAmount = ethers.parseEther("1000"); // 1000 SCR
    await scrToken.transfer(user1.address, scrAmount);
    await scrToken.transfer(user2.address, scrAmount);
  });

  describe("Deployment", function () {
    it("Should set the correct token addresses", async function () {
      expect(await burnerContract.scrToken()).to.equal(await scrToken.getAddress());
      expect(await burnerContract.usdtToken()).to.equal(await usdtToken.getAddress());
    });

    it("Should set the correct initial rate", async function () {
      const [numerator, denominator] = await burnerContract.getCurrentRate();
      expect(numerator).to.equal(INITIAL_RATE_NUMERATOR);
      expect(denominator).to.equal(INITIAL_RATE_DENOMINATOR);
    });

    it("Should set the correct owner", async function () {
      expect(await burnerContract.owner()).to.equal(owner.address);
    });
  });

  describe("Burn SCR for USDT", function () {
    it("Should burn SCR and receive USDT correctly", async function () {
      const scrAmount = ethers.parseEther("100"); // 100 SCR
      const expectedUSDT = ethers.parseUnits("3", 6); // 3 USDT (100 * 0.03)

      // Approve SCR
      await scrToken.connect(user1).approve(await burnerContract.getAddress(), scrAmount);

      // Check balances before
      const user1SCRBefore = await scrToken.balanceOf(user1.address);
      const user1USDTBefore = await usdtToken.balanceOf(user1.address);

      // Burn SCR
      const tx = await burnerContract.connect(user1).burnSCRForUSDT(scrAmount);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      await expect(tx)
        .to.emit(burnerContract, "SCRBurned")
        .withArgs(user1.address, scrAmount, expectedUSDT, block!.timestamp);

      // Check balances after
      const user1SCRAfter = await scrToken.balanceOf(user1.address);
      const user1USDTAfter = await usdtToken.balanceOf(user1.address);

      expect(user1SCRAfter).to.equal(user1SCRBefore - scrAmount);
      expect(user1USDTAfter).to.equal(user1USDTBefore + expectedUSDT);
    });

    it("Should handle different SCR amounts correctly", async function () {
      const testCases = [
        { scr: "10", expectedUsdt: "0.3" },
        { scr: "50", expectedUsdt: "1.5" },
        { scr: "200", expectedUsdt: "6" }
      ];

      for (const testCase of testCases) {
        const scrAmount = ethers.parseEther(testCase.scr);
        const expectedUSDT = ethers.parseUnits(testCase.expectedUsdt, 6);

        await scrToken.connect(user1).approve(await burnerContract.getAddress(), scrAmount);

        const user1USDTBefore = await usdtToken.balanceOf(user1.address);
        await burnerContract.connect(user1).burnSCRForUSDT(scrAmount);
        const user1USDTAfter = await usdtToken.balanceOf(user1.address);

        expect(user1USDTAfter - user1USDTBefore).to.equal(expectedUSDT);
      }
    });

    it("Should revert if amount is zero", async function () {
      await expect(
        burnerContract.connect(user1).burnSCRForUSDT(0)
      ).to.be.revertedWith("SCRBurner: amount must be greater than zero");
    });

    it("Should revert if user hasn't approved SCR", async function () {
      const scrAmount = ethers.parseEther("100");
      await expect(
        burnerContract.connect(user1).burnSCRForUSDT(scrAmount)
      ).to.be.reverted;
    });

    it("Should revert if pool has insufficient USDT", async function () {
      // Drain the pool
      const poolBalance = await burnerContract.getUSDTPoolBalance();
      await burnerContract.withdrawUSDT(poolBalance);

      const scrAmount = ethers.parseEther("100");
      await scrToken.connect(user1).approve(await burnerContract.getAddress(), scrAmount);

      await expect(
        burnerContract.connect(user1).burnSCRForUSDT(scrAmount)
      ).to.be.revertedWith("SCRBurner: insufficient USDT in pool");
    });
  });

  describe("Rate Management", function () {
    it("Should allow owner to update rate", async function () {
      const newNumerator = 5n;
      const newDenominator = 100n;

      await expect(burnerContract.setBurnRate(newNumerator, newDenominator))
        .to.emit(burnerContract, "BurnRateUpdated")
        .withArgs(INITIAL_RATE_NUMERATOR, INITIAL_RATE_DENOMINATOR, newNumerator, newDenominator);

      const [numerator, denominator] = await burnerContract.getCurrentRate();
      expect(numerator).to.equal(newNumerator);
      expect(denominator).to.equal(newDenominator);
    });

    it("Should apply new rate to subsequent burns", async function () {
      // Update rate to 5/100 = 0.05
      await burnerContract.setBurnRate(5, 100);

      const scrAmount = ethers.parseEther("100");
      const expectedUSDT = ethers.parseUnits("5", 6); // 100 * 0.05 = 5 USDT

      await scrToken.connect(user1).approve(await burnerContract.getAddress(), scrAmount);

      const user1USDTBefore = await usdtToken.balanceOf(user1.address);
      await burnerContract.connect(user1).burnSCRForUSDT(scrAmount);
      const user1USDTAfter = await usdtToken.balanceOf(user1.address);

      expect(user1USDTAfter - user1USDTBefore).to.equal(expectedUSDT);
    });

    it("Should revert if non-owner tries to update rate", async function () {
      await expect(
        burnerContract.connect(user1).setBurnRate(5, 100)
      ).to.be.revertedWithCustomError(burnerContract, "OwnableUnauthorizedAccount");
    });

    it("Should revert if denominator is zero", async function () {
      await expect(
        burnerContract.setBurnRate(5, 0)
      ).to.be.revertedWith("SCRBurner: denominator cannot be zero");
    });
  });

  describe("Pool Management", function () {
    it("Should allow owner to fund USDT pool", async function () {
      const fundAmount = ethers.parseUnits("1000", 6);
      await usdtToken.approve(await burnerContract.getAddress(), fundAmount);

      const poolBefore = await burnerContract.getUSDTPoolBalance();
      await expect(burnerContract.fundUSDTPool(fundAmount))
        .to.emit(burnerContract, "USDTPoolFunded")
        .withArgs(owner.address, fundAmount);

      const poolAfter = await burnerContract.getUSDTPoolBalance();
      expect(poolAfter - poolBefore).to.equal(fundAmount);
    });

    it("Should allow owner to withdraw USDT", async function () {
      const withdrawAmount = ethers.parseUnits("1000", 6);
      const ownerBalanceBefore = await usdtToken.balanceOf(owner.address);

      await expect(burnerContract.withdrawUSDT(withdrawAmount))
        .to.emit(burnerContract, "USDTWithdrawn")
        .withArgs(owner.address, withdrawAmount);

      const ownerBalanceAfter = await usdtToken.balanceOf(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(withdrawAmount);
    });

    it("Should revert if non-owner tries to fund pool", async function () {
      const fundAmount = ethers.parseUnits("1000", 6);
      await usdtToken.connect(user1).approve(await burnerContract.getAddress(), fundAmount);

      await expect(
        burnerContract.connect(user1).fundUSDTPool(fundAmount)
      ).to.be.revertedWithCustomError(burnerContract, "OwnableUnauthorizedAccount");
    });

    it("Should revert if non-owner tries to withdraw", async function () {
      const withdrawAmount = ethers.parseUnits("1000", 6);

      await expect(
        burnerContract.connect(user1).withdrawUSDT(withdrawAmount)
      ).to.be.revertedWithCustomError(burnerContract, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pause/Unpause", function () {
    it("Should allow owner to pause", async function () {
      await burnerContract.pause();
      expect(await burnerContract.paused()).to.be.true;
    });

    it("Should allow owner to unpause", async function () {
      await burnerContract.pause();
      await burnerContract.unpause();
      expect(await burnerContract.paused()).to.be.false;
    });

    it("Should prevent burning when paused", async function () {
      await burnerContract.pause();

      const scrAmount = ethers.parseEther("100");
      await scrToken.connect(user1).approve(await burnerContract.getAddress(), scrAmount);

      await expect(
        burnerContract.connect(user1).burnSCRForUSDT(scrAmount)
      ).to.be.revertedWithCustomError(burnerContract, "EnforcedPause");
    });

    it("Should revert if non-owner tries to pause", async function () {
      await expect(
        burnerContract.connect(user1).pause()
      ).to.be.revertedWithCustomError(burnerContract, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    it("Should correctly calculate USDT amount", async function () {
      const scrAmount = ethers.parseEther("100");
      const expectedUSDT = ethers.parseUnits("3", 6); // 100 * 0.03

      const calculatedUSDT = await burnerContract.calculateUSDTAmount(scrAmount);
      expect(calculatedUSDT).to.equal(expectedUSDT);
    });

    it("Should return correct pool balance", async function () {
      const poolBalance = await burnerContract.getUSDTPoolBalance();
      const actualBalance = await usdtToken.balanceOf(await burnerContract.getAddress());
      expect(poolBalance).to.equal(actualBalance);
    });

    it("Should return correct SCR balance", async function () {
      const scrBalance = await burnerContract.getSCRBalance();
      expect(scrBalance).to.equal(0); // No SCR burned yet
    });
  });
});
