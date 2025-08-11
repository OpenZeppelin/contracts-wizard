export interface OpenZeppelinContracts {
  /**
   * Version of `@openzeppelin/contracts` and `@openzeppelin/contracts-upgradeable`
   */
  contractsVersion: string;
  /**
   * Version of `@openzeppelin/community-contracts`
   */
  communityContractsVersion: string;
  /**
   * Map of source file path to source code.
   */
  sources: Record<string, string>;
  /**
   * Map of source file path to the list of all source file paths it depends on (including transitive dependencies).
   */
  dependencies: Record<string, string[]>;
}

declare const contracts: OpenZeppelinContracts;

export default contracts;
