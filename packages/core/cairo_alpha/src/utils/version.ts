/**
 * The actual latest version to use in links.
 */
export const contractsVersion = '3.0.0-alpha.1';
export const contractsVersionTag = `v${contractsVersion}`;

/**
 * Cairo compiler versions.
 */
export const edition = '2024_07';
export const cairoVersion = '2.12.0';
export const scarbVersion = '2.12.0';

/**
 * Semantic version string representing of the minimum compatible version of Contracts to display in output.
 * If this targets a stable version, it should use a range (e.g. ^2.0.0)
 * If this targets an alpha version, it should be pinned to the exact version (e.g. not using ^)
 */
export const compatibleContractsSemver = '3.0.0-alpha.1';
