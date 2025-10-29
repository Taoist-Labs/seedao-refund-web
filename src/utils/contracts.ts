import { Contract } from 'ethers'
import type { BrowserProvider } from 'ethers'
import { CONTRACT_ADDRESSES } from './constants'

// Import ABIs from compiled contracts
import TestSCRArtifact from '../../artifacts/contracts/TestSCR.sol/TestSCR.json'
import TestUSDTArtifact from '../../artifacts/contracts/TestUSDT.sol/TestUSDT.json'
import SCRBurnerArtifact from '../../artifacts/contracts/SCRBurner.sol/SCRBurner.json'

export const ABIS = {
  TestSCR: TestSCRArtifact.abi,
  TestUSDT: TestUSDTArtifact.abi,
  SCRBurner: SCRBurnerArtifact.abi,
}

export function getSCRContract(provider: BrowserProvider) {
  return new Contract(CONTRACT_ADDRESSES.SCR_TOKEN, ABIS.TestSCR, provider)
}

export function getUSDTContract(provider: BrowserProvider) {
  return new Contract(CONTRACT_ADDRESSES.USDT_TOKEN, ABIS.TestUSDT, provider)
}

export function getBurnerContract(provider: BrowserProvider) {
  return new Contract(CONTRACT_ADDRESSES.BURNER, ABIS.SCRBurner, provider)
}
