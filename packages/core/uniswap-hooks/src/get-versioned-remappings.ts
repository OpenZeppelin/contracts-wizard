import contracts from '@openzeppelin/wizard/openzeppelin-contracts';
import { compatibleContractsSemver } from './utils/version';

export function getVersionedRemappings(): string[] {
  return [
    `@openzeppelin/contracts/=@openzeppelin/contracts@${contracts.version}/`,
    `@openzeppelin/uniswap-hooks/=@openzeppelin/uniswap-hooks@${compatibleContractsSemver}/src/`,
  ];
}
