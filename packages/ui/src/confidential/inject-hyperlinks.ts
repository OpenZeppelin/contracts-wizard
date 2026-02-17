import { version as contractsVersion } from '@openzeppelin/contracts/package.json';
import { version as confidentialContractsVersion } from '@openzeppelin/confidential-contracts/package.json';
import { version as fhevmSolidityVersion } from '@fhevm/solidity/package.json';

function remapFhevmNpmVersionToGitTag(version: string): string {
  // The FHEVM Solidity contracts are published on npm with version 0.9.1, but correspond to tag 0.9.14.
  if (version === '0.9.1') {
    return 'v0.9.14';
  }
  return `v${version}`;
}

export function injectHyperlinks(code: string) {
  // We are modifying HTML, so use HTML escaped chars. The pattern excludes paths that include /../ in the URL.
  const importContractsRegex =
    /&quot;(@openzeppelin\/)(contracts-upgradeable\/|contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;
  const importConfidentialContractsRegex =
    /&quot;(@openzeppelin\/)(confidential-contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;
  const importFhevmSolidityRegex = /&quot;(@fhevm\/)(solidity\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;

  return code
    .replace(
      importContractsRegex,
      `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-$2blob/v${contractsVersion}/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
    )
    .replace(
      importConfidentialContractsRegex,
      `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-confidential-contracts/blob/v${confidentialContractsVersion}/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
    )
    .replace(
      importFhevmSolidityRegex,
      `&quot;<a class="import-link" href="https://github.com/zama-ai/fhevm/blob/${remapFhevmNpmVersionToGitTag(fhevmSolidityVersion)}/library-solidity/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
    );
}
