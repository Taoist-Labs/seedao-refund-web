import { Contract } from 'ethers'
import type { ContractRunner } from 'ethers'
import { config } from '../config'

// Import ABIs - same ABIs work for both test and production tokens
import ERC20ABI from '../abis/ERC20.json'
import SCRBurnerUpgradeableABI from '../abis/SCRBurnerUpgradeable.json'

export const ABIS = {
  ERC20: ERC20ABI.abi,
  SCRBurnerUpgradeable: SCRBurnerUpgradeableABI.abi,
}

export function getSCRContract(runner: ContractRunner) {
  return new Contract(config.contracts.scrToken, ABIS.ERC20, runner)
}

export function getUSDTContract(runner: ContractRunner) {
  return new Contract(config.contracts.usdtToken, ABIS.ERC20, runner)
}

export function getBurnerContract(runner: ContractRunner) {
  return new Contract(config.contracts.burner, ABIS.SCRBurnerUpgradeable, runner)
}
