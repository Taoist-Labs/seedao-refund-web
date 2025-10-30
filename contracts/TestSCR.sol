// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title TestSCR
 * @dev Test SCR token for local testing - matches ScoreV4 behavior
 * Features: Standard ERC20, Burnable with role control, Mintable (for testing)
 */
contract TestSCR is ERC20, AccessControl {
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC20("Score", "SCR") {
        // Grant admin and roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);

        // Mint initial supply to deployer for testing
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    /**
     * @dev Mint tokens - only for testing purposes
     * @param to Address to receive tokens
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
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

    /**
     * @dev Burns tokens from the caller - requires BURNER_ROLE
     * @param amount Amount to burn
     */
    function burn(uint256 amount) public {
        require(hasRole(BURNER_ROLE, _msgSender()), "TestSCR: must have burner role to burn");
        _burn(_msgSender(), amount);
    }

    /**
     * @dev Burns tokens from account using allowance - requires BURNER_ROLE
     * @param account Account to burn from
     * @param amount Amount to burn
     */
    function burnFrom(address account, uint256 amount) public {
        require(hasRole(BURNER_ROLE, _msgSender()), "TestSCR: must have burner role to burn");
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }
}
