import contractsVersion from '@openzeppelin/wizard/openzeppelin-contracts-version.json';
import contractVersionPins from '../contract-version-pins.json';

export function getVersionedRemappings(): string[] {
  return [
    `@openzeppelin/contracts/=@openzeppelin/contracts@${contractsVersion.version}/`,
    `@openzeppelin/confidential-contracts/=@openzeppelin/confidential-contracts@${contractVersionPins.confidentialContractsVersion}/`,
    `@fhevm/solidity/=@fhevm/solidity@${contractVersionPins.fhevmSolidityVersion}/`,
  ];
}
