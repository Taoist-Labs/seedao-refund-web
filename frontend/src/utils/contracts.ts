import { Contract } from 'ethers'
import type { ContractRunner } from 'ethers'
import { config } from '../config'

// Import ABIs from compiled contracts
import TestSCRArtifact from '@artifacts/contracts/TestSCR.sol/TestSCR.json'
import TestUSDTArtifact from '@artifacts/contracts/TestUSDT.sol/TestUSDT.json'
import SCRBurnerArtifact from '@artifacts/contracts/SCRBurner.sol/SCRBurner.json'

export const ABIS = {
  TestSCR: TestSCRArtifact.abi,
  TestUSDT: TestUSDTArtifact.abi,
  SCRBurner: SCRBurnerArtifact.abi,
}

export function getSCRContract(runner: ContractRunner) {
  return new Contract(config.contracts.scrToken, ABIS.TestSCR, runner)
}

export function getUSDTContract(runner: ContractRunner) {
  return new Contract(config.contracts.usdtToken, ABIS.TestUSDT, runner)
}

export function getBurnerContract(runner: ContractRunner) {
  return new Contract(config.contracts.burner, ABIS.SCRBurner, runner)
}
