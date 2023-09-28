import { version as contractsVersion } from "@openzeppelin/contracts/package.json";

export function injectHyperlinks(code: string) {
  // We are modifying HTML, so use HTML escaped chars. The pattern excludes paths that include /../ in the URL.
  const importRegex = /&quot;(@openzeppelin\/)(contracts-upgradeable\/|contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g

  return code.replace(importRegex, `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/openzeppelin-$2blob/v${contractsVersion}/contracts/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`);
}
