import { version as contractsVersion } from '@openzeppelin/contracts/package.json';

export function injectHyperlinks(code: string) {
  // We are modifying HTML, so use HTML escaped chars. The pattern excludes paths that include /../ in the URL.
  const contractsRegex =
    /&quot;(@openzeppelin\/)(contracts-upgradeable\/|contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;
  const communityContractsRegex = /&quot;(@openzeppelin\/)(community-contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;
  const uniswapV4CoreRegex = /&quot;(@uniswap\/)(v4-core\/contracts\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;
  const ozUniswapHooksRegex = /&quot;(@openzeppelin\/)(uniswap-hooks\/src\/)((?:(?!\.\.)[^/]+\/)*?[^/]*?)&quot;/g;

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
      uniswapV4CoreRegex,
      `&quot;<a class="import-link" href="https://github.com/Uniswap/v4-core/blob/main/src/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
    )
    .replace(
      ozUniswapHooksRegex,
      `&quot;<a class="import-link" href="https://github.com/OpenZeppelin/uniswap-hooks/blob/master/src/$3" target="_blank" rel="noopener noreferrer">$1$2$3</a>&quot;`,
    );
}
