import type { CommonOptions } from './common-options';
import { getRawCompatibleContractsSemver } from './utils/version';

export function getVersionedRemappings(opts?: CommonOptions): string[] {
  const remappings = [`@openzeppelin/contracts/=@openzeppelin/contracts@${getRawCompatibleContractsSemver()}/`];
  if (opts?.upgradeable) {
    remappings.push(
      `@openzeppelin/contracts-upgradeable/=@openzeppelin/contracts-upgradeable@${getRawCompatibleContractsSemver()}/`,
    );
  }
  return remappings;
}
