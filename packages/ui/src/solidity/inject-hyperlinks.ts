import { version as contractsVersion } from "@openzeppelin/contracts/package.json";

export function injectHyperlinks(code: string) {
  // We are modifying HTML, so use HTML escaped chars. The pattern excludes paths that include /../ in the URL.
  const contractsRegex =
    /&quot;(@openzeppelin\/)(contracts-upgradeable\/|contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;
  const communityContractsRegex =
    /&quot;(@openzeppelin\/)(community-contracts\/contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;

  return code
    .replace(
      contractsRegex,
      `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-$2blob/v${contractsVersion}/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
    )
    .replace(
      communityContractsRegex,
      `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-community-contracts/blob/master/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
    );
}
