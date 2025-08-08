import { version as contractsVersion } from '@openzeppelin/contracts/package.json';
import { version as optimismContractsVersion } from '@eth-optimism/contracts-bedrock/package.json';

export function injectHyperlinks(code: string) {
  // We are modifying HTML, so use HTML escaped chars. The pattern excludes paths that include /../ in the URL.
  const contractsRegex =
    /&quot;(@openzeppelin\/)(contracts-upgradeable\/|contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;
  const communityContractsRegex = /&quot;(@openzeppelin\/)(community-contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;
  const optimismContractsRegex = /&quot;(@eth-optimism\/)(contracts-bedrock\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;

  return code
    .replace(
      contractsRegex,
      `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-$2blob/v${contractsVersion}/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
    )
    .replace(
      communityContractsRegex,
      `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-community-contracts/blob/master/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
    )
    .replace(
      optimismContractsRegex,
      `&quot;<a class="import-link" href="https://github.com/ethereum-optimism/optimism/blob/%40eth-optimism/contracts-bedrock%40${optimismContractsVersion}/packages/contracts-bedrock/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
    );
}
