import contracts from '@openzeppelin/wizard/openzeppelin-contracts';
import contractVersionPins from '../contract-version-pins';

export function getVersionedRemappings(): string[] {
  return [
    `@openzeppelin/contracts/=@openzeppelin/contracts@${contracts.version}/`,
    `@openzeppelin/confidential-contracts/=@openzeppelin/confidential-contracts@${contractVersionPins.confidentialContractsVersion}/`,
    `@fhevm/solidity/=@fhevm/solidity@${contractVersionPins.fhevmSolidityVersion}/`,
  ];
}
