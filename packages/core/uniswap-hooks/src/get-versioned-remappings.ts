import type { CommonOptions } from '@openzeppelin/wizard';
import contracts from '@openzeppelin/wizard/openzeppelin-contracts';
import { compatibleContractsSemver } from './utils/version';

export function getVersionedRemappings(opts?: CommonOptions): string[] {
  const remappings = [
    `@openzeppelin/contracts/=@openzeppelin/contracts@${contracts.version}/`,
    `@openzeppelin/uniswap-hooks/=@openzeppelin/uniswap-hooks@${compatibleContractsSemver}/`,
  ];
  if (opts?.upgradeable) {
    remappings.push(
      `@openzeppelin/contracts-upgradeable/=@openzeppelin/contracts-upgradeable@${contracts.version}/`,
    );
  }
  return remappings;
}
