import { devDependencies } from '../../package.json';

export function getCommunityContractsGitCommit(): string {
  const communityContractsVersion = devDependencies['@openzeppelin/community-contracts'];
  if (!communityContractsVersion) {
    throw new Error('@openzeppelin/community-contracts not found in devDependencies');
  }
  return extractGitCommitHash('@openzeppelin/community-contracts', communityContractsVersion);
}

function extractGitCommitHash(dependencyName: string, dependencyVersion: string): string {
  const split = dependencyVersion.split('#');
  if (!dependencyVersion.startsWith('git+') || split.length !== 2) {
    throw new Error(
      `Expected package dependency for ${dependencyName} in format git+<url>#<commit-hash>, but got ${dependencyVersion}`,
    );
  }
  const hash = split[1]!;
  if (!/^[0-9a-f]{40}$/.test(hash)) {
    throw new Error(
      `Expected git commit hash for package dependency ${dependencyName} to have 40 hex chars, but got ${hash}`,
    );
  }
  return hash;
}
