// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title SCRBurnerUpgradeable
 * @dev Upgradeable contract that allows users to burn SCR tokens and receive USDT
 * Uses UUPS (Universal Upgradeable Proxy Standard) pattern
 *
 * Features:
 * - Configurable exchange rate (numerator/denominator)
 * - Pausable for emergencies
 * - Owner can fund/withdraw USDT pool
 * - Reentrancy protection
 * - Upgradeable via UUPS pattern
 */
contract SCRBurnerUpgradeable is
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    IERC20 public scrToken;
    IERC20 public usdtToken;

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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializer function (replaces constructor for upgradeable contracts)
     * @param _scrToken Address of SCR token
     * @param _usdtToken Address of USDT token
     * @param _rateNumerator Initial rate numerator (default: 3)
     * @param _rateDenominator Initial rate denominator (default: 100)
     */
    function initialize(
        address _scrToken,
        address _usdtToken,
        uint256 _rateNumerator,
        uint256 _rateDenominator
    ) public initializer {
        require(_scrToken != address(0), "SCRBurner: invalid SCR address");
        require(_usdtToken != address(0), "SCRBurner: invalid USDT address");
        require(_rateDenominator > 0, "SCRBurner: denominator cannot be zero");

        __Ownable_init(msg.sender);
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

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
     * @dev Get current exchange rate
     * @return numerator The rate numerator
     * @return denominator The rate denominator
     */
    function getCurrentRate() external view returns (uint256 numerator, uint256 denominator) {
        return (rateNumerator, rateDenominator);
    }

    /**
     * @dev Function that authorizes an upgrade - only owner can upgrade
     * Required by UUPS pattern
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
