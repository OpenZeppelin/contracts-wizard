import openzeppelinContractsVersion from '@openzeppelin/wizard/openzeppelin-contracts-version.json';
import { compatibleContractsSemver } from './utils/version';

export function getVersionedRemappings(): string[] {
  return [
    `@openzeppelin/contracts/=@openzeppelin/contracts@${openzeppelinContractsVersion.version}/`,
    `@openzeppelin/uniswap-hooks/=@openzeppelin/uniswap-hooks@${compatibleContractsSemver}/src/`,
  ];
}
