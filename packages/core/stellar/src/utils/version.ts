/**
 * The actual latest version to use in links.
 */
export const contractsVersion = '0.3.0';
export const contractsVersionTag = `v${contractsVersion}`;

/**
 * Semantic version string representing of the minimum compatible version of Contracts to display in output.
 */
export const compatibleContractsSemver = '^0.3.0';

/**
 * The Soroban version for which compilation and testing have passing tests
 */
export const compatibleSorobanVersion = '22.0.8';

/**
 * The dependencies used in contracts
 */
export const stellarDependencies = {
  base: ['stellar-default-impl-macro'],
  fungible: ['stellar-fungible'],
  nonFungible: ['stellar-non-fungible'],
  pausable: ['stellar-pausable', 'stellar-pausable-macros'],
  upgradable: ['stellar-upgradeable', 'stellar-upgradeable-macros'],
  accessControl: ['stellar-access-control', 'stellar-access-control-macros'],
  ownable: ['stellar-ownable', 'stellar-ownable-macro'],
} as const;
