import { devDependencies } from '../../package.json';

/**
 * @returns The git commit hash of the @openzeppelin/community-contracts package dependency.
 * @throws Error if the @openzeppelin/community-contracts package dependency is not found in devDependencies.
 */
export function getCommunityContractsGitCommit(): string {
  const communityContractsVersion = devDependencies['@openzeppelin/community-contracts'];
  if (!communityContractsVersion) {
    throw new Error('@openzeppelin/community-contracts not found in devDependencies');
  }
  return extractGitCommitHash('@openzeppelin/community-contracts', communityContractsVersion);
}

/**
 * Extracts the git commit hash from a package dependency version string.
 * The expected format is `git+<url>#<commit-hash>`.
 *
 * @param dependencyName The name of the package dependency.
 * @param dependencyVersion The version string of the package dependency.
 * @returns The git commit hash, normalized to lowercase.
 * @throws Error if the version string or commit hash is not in the expected format.
 */
export function extractGitCommitHash(dependencyName: string, dependencyVersion: string): string {
  const split = dependencyVersion.split('#');
  if (!dependencyVersion.startsWith('git+') || split.length !== 2) {
    throw new Error(
      `Expected package dependency for ${dependencyName} in format git+<url>#<commit-hash>, but got ${dependencyVersion}`,
    );
  }
  const hash = split[1]!;
  if (!/^[a-fA-F0-9]{7,40}$/.test(hash)) {
    throw new Error(
      `Expected git commit hash for package dependency ${dependencyName} to have between 7 and 40 hex chars, but got ${hash}`,
    );
  }
  return hash.toLowerCase();
}
