import { devDependencies } from '../../package.json';

export function getCommunityContractsGitCommit(): string {
  const communityContractsVersion = devDependencies['@openzeppelin/community-contracts'];
  if (!communityContractsVersion) {
    throw new Error('@openzeppelin/community-contracts not found in devDependencies');
  }
  return extractGitCommitHash('@openzeppelin/community-contracts', communityContractsVersion);
}

function extractGitCommitHash(dependencyName: string, dependencyVersion: string): string {
  const splitHash = dependencyVersion.split('#');
  if (!dependencyVersion.startsWith('git+') || splitHash.length !== 2) {
    throw new Error(
      `Expected package dependency for ${dependencyName} in format git+<url>#<commit-hash>, but got ${dependencyVersion}`,
    );
  }
  return splitHash[1]!;
}
