import { version as contractsVersion } from '@openzeppelin/contracts/package.json';

export function injectHyperlinks(code: string) {
  // We are modifying HTML, so use HTML escaped chars. The pattern excludes paths that include /../ in the URL.
  const importContractsRegex =
    /&quot;(@openzeppelin\/)(contracts-upgradeable\/|contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;
  const importCommunityContractsRegex =
    /&quot;(@openzeppelin\/)(community-contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;

  const compatibleCommunityContractsRegexSingle = /Community Contracts commit ([a-fA-F0-9]{7,40})/;
  const compatibleCommunityContractsRegexGlobal = new RegExp(compatibleCommunityContractsRegexSingle.source, 'g');

  const compatibleCommunityContractsGitCommit = code.match(compatibleCommunityContractsRegexSingle)?.[1];

  let result = code.replace(
    importContractsRegex,
    `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-$2blob/v${contractsVersion}/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
  );

  if (compatibleCommunityContractsGitCommit !== undefined) {
    result = result
      .replace(
        importCommunityContractsRegex,
        `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-community-contracts/blob/${compatibleCommunityContractsGitCommit}/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
      )
      .replace(
        compatibleCommunityContractsRegexGlobal,
        `Community Contracts commit <a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-community-contracts/tree/$1" target="_blank" rel="noopener noreferrer" title="View repository at commit $1">$1</a>`,
      );
  }

  return result;
}
