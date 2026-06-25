import { version as contractsVersion } from '@openzeppelin/contracts/package.json';

export function injectHyperlinks(code: string) {
  // We are modifying HTML, so use HTML escaped chars. The pattern excludes paths that include /../ in the URL.
  const importContractsRegex =
    /&quot;(@openzeppelin\/)(contracts-upgradeable\/|contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;
  const importCommunityContractsRegex =
    /&quot;(@openzeppelin\/)(community-contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;
  // @openzeppelin/tron-contracts mirrors @openzeppelin/contracts on the TRON
  // VM, and @openzeppelin/tron-contracts-upgradeable is its upgradeable build.
  // Their versioning is independent (currently 0.x) and doesn't ship git tags
  // that mirror @openzeppelin/contracts, so we link to the default branch
  // instead of pinning a tag like the Solidity link does. The upgradeable
  // pattern is handled first so it isn't shadowed by the base one.
  const importTronContractsUpgradeableRegex =
    /&quot;(@openzeppelin\/)(tron-contracts-upgradeable\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;
  const importTronContractsRegex = /&quot;(@openzeppelin\/)(tron-contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;

  const compatibleCommunityContractsRegexSingle = /Community Contracts commit ([a-fA-F0-9]{7,40})/;
  const compatibleCommunityContractsRegexGlobal = new RegExp(compatibleCommunityContractsRegexSingle.source, 'g');

  const compatibleCommunityContractsGitCommit = code.match(compatibleCommunityContractsRegexSingle)?.[1];

  let result = code
    .replace(
      importContractsRegex,
      `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-$2blob/v${contractsVersion}/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
    )
    .replace(
      importTronContractsUpgradeableRegex,
      `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/tron-contracts-upgradeable/blob/master/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
    )
    .replace(
      importTronContractsRegex,
      `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/tron-contracts/blob/master/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
    );

  if (compatibleCommunityContractsGitCommit !== undefined) {
    result = result
      .replace(
        importCommunityContractsRegex,
        `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-community-contracts/blob/${compatibleCommunityContractsGitCommit}/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
      )
      .replace(
        compatibleCommunityContractsRegexGlobal,
        `Community Contracts commit <a class="comment-link" href="https://github.com/OpenZeppelin/openzeppelin-community-contracts/tree/$1" target="_blank" rel="noopener noreferrer" title="View repository at commit $1">$1</a>`,
      );
  }

  return result;
}
