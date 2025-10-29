// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestSCR
 * @dev Test SCR token for local testing - simplified version of ScoreV4
 * Features: Standard ERC20, Burnable, Mintable (for testing)
 */
contract TestSCR is ERC20, ERC20Burnable, Ownable {
    constructor() ERC20("Score", "SCR") Ownable(msg.sender) {
        // Mint initial supply to deployer for testing
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    /**
     * @dev Mint tokens - only for testing purposes
     * @param to Address to receive tokens
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Faucet function - allows anyone to get test tokens
     * @param amount Amount to mint (limited to 10000 tokens per call)
     */
    function faucet(uint256 amount) public {
        require(amount <= 10000 * 10**decimals(), "TestSCR: amount too large");
        _mint(msg.sender, amount);
    }
}
