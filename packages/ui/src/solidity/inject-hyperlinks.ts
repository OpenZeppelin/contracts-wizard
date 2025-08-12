import { version as contractsVersion } from '@openzeppelin/contracts/package.json';
import { getCommunityContractsGitCommit } from '@openzeppelin/wizard/src/utils/community-contracts-git-commit';

export function injectHyperlinks(code: string) {
  // We are modifying HTML, so use HTML escaped chars. The pattern excludes paths that include /../ in the URL.
  const importContractsRegex =
    /&quot;(@openzeppelin\/)(contracts-upgradeable\/|contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;
  const importCommunityContractsRegex =
    /&quot;(@openzeppelin\/)(community-contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;

  const compatibleCommunityContractsRegex = /OpenZeppelin Community Contracts commit ([a-f0-9]{40})/g;

  return code
    .replace(
      importContractsRegex,
      `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-$2blob/v${contractsVersion}/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
    )
    .replace(
      importCommunityContractsRegex,
      `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-community-contracts/tree/${getCommunityContractsGitCommit()}/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
    )
    .replace(
      compatibleCommunityContractsRegex,
      `OpenZeppelin Community Contracts commit <a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-community-contracts/tree/$1" target="_blank" rel="noopener noreferrer" title="View repository at commit $1">$1</a>`,
    );
}
