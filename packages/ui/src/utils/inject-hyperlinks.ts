import { version as contractsVersion } from "@openzeppelin/contracts/package.json";

export function injectHyperlinks(code: string) {
  const importRegex = /(@openzeppelin\/)(contracts-upgradeable\/|contracts\/)(.*)(&quot;)/g // we are modifying HTML, so use HTML escaped chars
  return code.replace(importRegex, `<a href='https://github.com/OpenZeppelin/openzeppelin-$2blob/v${contractsVersion}/contracts/$3' target='_blank' rel='noopener noreferrer'>$1$2$3</a>$4`);
}