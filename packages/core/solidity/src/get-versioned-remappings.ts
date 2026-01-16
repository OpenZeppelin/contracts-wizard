import contractsVersion from '../openzeppelin-contracts-version';
import type { CommonOptions } from './common-options';

export function getVersionedRemappings(opts?: CommonOptions): string[] {
  const remappings = [`@openzeppelin/contracts/=@openzeppelin/contracts@${contractsVersion.version}/`];
  if (opts?.upgradeable) {
    remappings.push(
      `@openzeppelin/contracts-upgradeable/=@openzeppelin/contracts-upgradeable@${contractsVersion.version}/`,
    );
  }
  return remappings;
}
