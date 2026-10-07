/**
 * The actual latest version to use in links.
 *
 * This is the version of the `miden-protocol` and `miden-standards` crates of the Miden protocol
 * (https://github.com/0xMiden/protocol) that the generated code targets.
 */
export const contractsVersion = '0.17.0';

/**
 * The git tag of `contractsVersion` in the Miden protocol repository, used in links.
 */
export const contractsVersionTag = `v${contractsVersion}`;

/**
 * Semantic version string representing of the minimum compatible version of the Miden protocol crates to display in output.
 */
export const compatibleContractsSemver = `^${contractsVersion}`;
