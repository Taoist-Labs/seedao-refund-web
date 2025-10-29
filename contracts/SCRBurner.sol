// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SCRBurner
 * @dev Contract that allows users to burn SCR tokens and receive USDT
 * Features:
 * - Configurable exchange rate (numerator/denominator)
 * - Pausable for emergencies
 * - Owner can fund/withdraw USDT pool
 * - Reentrancy protection
 */
contract SCRBurner is Ownable, Pausable, ReentrancyGuard {
    IERC20 public immutable scrToken;
    IERC20 public immutable usdtToken;

    // Exchange rate: 1 SCR = (rateNumerator / rateDenominator) USDT
    // Default: 3/100 = 0.03 USDT per SCR
    uint256 public rateNumerator;
    uint256 public rateDenominator;

    // Events
    event SCRBurned(
        address indexed user,
        uint256 scrAmount,
        uint256 usdtAmount,
        uint256 timestamp
    );
    event BurnRateUpdated(
        uint256 oldNumerator,
        uint256 oldDenominator,
        uint256 newNumerator,
        uint256 newDenominator
    );
    event USDTPoolFunded(address indexed from, uint256 amount);
    event USDTWithdrawn(address indexed to, uint256 amount);

    /**
     * @dev Constructor
     * @param _scrToken Address of SCR token
     * @param _usdtToken Address of USDT token
     * @param _rateNumerator Initial rate numerator (default: 3)
     * @param _rateDenominator Initial rate denominator (default: 100)
     */
    constructor(
        address _scrToken,
        address _usdtToken,
        uint256 _rateNumerator,
        uint256 _rateDenominator
    ) Ownable(msg.sender) {
        require(_scrToken != address(0), "SCRBurner: invalid SCR address");
        require(_usdtToken != address(0), "SCRBurner: invalid USDT address");
        require(_rateDenominator > 0, "SCRBurner: denominator cannot be zero");

        scrToken = IERC20(_scrToken);
        usdtToken = IERC20(_usdtToken);
        rateNumerator = _rateNumerator;
        rateDenominator = _rateDenominator;
    }

    /**
     * @dev Main function: Burn SCR tokens and receive USDT
     * @param scrAmount Amount of SCR tokens to burn
     */
    function burnSCRForUSDT(uint256 scrAmount)
        external
        nonReentrant
        whenNotPaused
    {
        require(scrAmount > 0, "SCRBurner: amount must be greater than zero");

        // Calculate USDT amount to send
        uint256 usdtAmount = calculateUSDTAmount(scrAmount);
        require(usdtAmount > 0, "SCRBurner: USDT amount too small");

        // Check if contract has enough USDT
        uint256 usdtBalance = usdtToken.balanceOf(address(this));
        require(usdtBalance >= usdtAmount, "SCRBurner: insufficient USDT in pool");

        // Transfer SCR from user to this contract
        require(
            scrToken.transferFrom(msg.sender, address(this), scrAmount),
            "SCRBurner: SCR transfer failed"
        );

        // Burn the SCR tokens
        // If SCR has a burn function, we'd call it. For ERC20Burnable:
        // IERC20Burnable(address(scrToken)).burn(scrAmount);
        // For now, tokens stay in this contract (effectively burned from circulation)

        // Transfer USDT to user
        require(
            usdtToken.transfer(msg.sender, usdtAmount),
            "SCRBurner: USDT transfer failed"
        );

        emit SCRBurned(msg.sender, scrAmount, usdtAmount, block.timestamp);
    }

    /**
     * @dev Calculate USDT amount based on SCR amount and current rate
     * @param scrAmount Amount of SCR tokens
     * @return Amount of USDT to receive
     */
    function calculateUSDTAmount(uint256 scrAmount) public view returns (uint256) {
        // Get decimals for both tokens
        uint8 scrDecimals = IERC20Metadata(address(scrToken)).decimals();
        uint8 usdtDecimals = IERC20Metadata(address(usdtToken)).decimals();

        // Calculate USDT amount: scrAmount * rateNumerator / rateDenominator
        uint256 usdtAmount = (scrAmount * rateNumerator) / rateDenominator;

        // Adjust for decimal differences
        if (scrDecimals > usdtDecimals) {
            usdtAmount = usdtAmount / (10 ** (scrDecimals - usdtDecimals));
        } else if (usdtDecimals > scrDecimals) {
            usdtAmount = usdtAmount * (10 ** (usdtDecimals - scrDecimals));
        }

        return usdtAmount;
    }

    /**
     * @dev Update the burn rate - only owner
     * @param newNumerator New rate numerator
     * @param newDenominator New rate denominator
     */
    function setBurnRate(uint256 newNumerator, uint256 newDenominator)
        external
        onlyOwner
    {
        require(newDenominator > 0, "SCRBurner: denominator cannot be zero");

        emit BurnRateUpdated(
            rateNumerator,
            rateDenominator,
            newNumerator,
            newDenominator
        );

        rateNumerator = newNumerator;
        rateDenominator = newDenominator;
    }

    /**
     * @dev Fund the USDT pool - only owner
     * @param amount Amount of USDT to deposit
     */
    function fundUSDTPool(uint256 amount) external onlyOwner {
        require(amount > 0, "SCRBurner: amount must be greater than zero");

        require(
            usdtToken.transferFrom(msg.sender, address(this), amount),
            "SCRBurner: USDT transfer failed"
        );

        emit USDTPoolFunded(msg.sender, amount);
    }

    /**
     * @dev Withdraw USDT from pool - only owner (emergency)
     * @param amount Amount of USDT to withdraw
     */
    function withdrawUSDT(uint256 amount) external onlyOwner {
        require(amount > 0, "SCRBurner: amount must be greater than zero");

        uint256 balance = usdtToken.balanceOf(address(this));
        require(balance >= amount, "SCRBurner: insufficient balance");

        require(
            usdtToken.transfer(msg.sender, amount),
            "SCRBurner: USDT transfer failed"
        );

        emit USDTWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Pause the contract - only owner
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract - only owner
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get current USDT pool balance
     */
    function getUSDTPoolBalance() external view returns (uint256) {
        return usdtToken.balanceOf(address(this));
    }

    /**
     * @dev Get current SCR balance in contract
     */
    function getSCRBalance() external view returns (uint256) {
        return scrToken.balanceOf(address(this));
    }

    /**
     * @dev Get current exchange rate as a readable string (for display)
     * @return numerator The rate numerator
     * @return denominator The rate denominator
     */
    function getCurrentRate() external view returns (uint256 numerator, uint256 denominator) {
        return (rateNumerator, rateDenominator);
    }
}
