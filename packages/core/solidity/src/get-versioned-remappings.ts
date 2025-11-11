import type { CommonOptions } from './common-options';
import contracts from '../openzeppelin-contracts';

export function getVersionedRemappings(opts?: CommonOptions): string[] {
  const remappings = [`@openzeppelin/contracts/=@openzeppelin/contracts@${contracts.version}/`];
  if (opts?.upgradeable) {
    remappings.push(`@openzeppelin/contracts-upgradeable/=@openzeppelin/contracts-upgradeable@${contracts.version}/`);
  }
  return remappings;
}
