import type { CommonOptions } from './common-options';
import contractsVersion from '../openzeppelin-contracts-version.json';

export function getVersionedRemappings(opts?: CommonOptions & { chainlinkAce?: boolean }): string[] {
  const remappings = [`@openzeppelin/contracts/=@openzeppelin/contracts@${contractsVersion.version}/`];
  if (opts?.upgradeable) {
    remappings.push(
      `@openzeppelin/contracts-upgradeable/=@openzeppelin/contracts-upgradeable@${contractsVersion.version}/`,
    );
  }
  if (opts?.chainlinkAce) remappings.push('@chainlink/ace/=@chainlink/ace@1.2.0/');
  return remappings;
}
