// Aliases the internal Solidity contract `Kind` to the TRON-branded token shown
// in the URL fragment, and back. This lets `/tron` URLs read `#trc20` (matching
// the tab labels and generated code) while the wizard keeps reusing the Solidity
// `ERC20` kind internally — TRON renames only the standard *names*, not the kinds.
//
// Only the standards TRON rebrands are aliased; kinds without a TRC counterpart
// (Governor, Custom) pass through unchanged. Legacy `#erc20`-style fragments also
// pass through and still resolve via `sanitizeKind`, so existing links keep working.

// Internal kind -> lowercase URL token. Keep in sync with the `tabLabels`
// override in `tron/App.svelte`.
const KIND_TO_URL_TAB: Record<string, string> = {
  ERC20: 'trc20',
  ERC721: 'trc721',
  ERC1155: 'trc1155',
};

const URL_TAB_TO_KIND: Record<string, string> = Object.fromEntries(
  Object.entries(KIND_TO_URL_TAB).map(([kind, urlTab]) => [urlTab, kind]),
);

/** Internal kind (e.g. `ERC20`) -> URL token (e.g. `trc20`). Unmapped kinds pass through. */
export function tronKindToUrlTab(kind: string): string {
  return KIND_TO_URL_TAB[kind] ?? kind;
}

/** URL token (e.g. `trc20`) -> kind (e.g. `ERC20`). Unmapped/legacy tokens (e.g. `erc20`) pass through. */
export function tronUrlTabToKind(urlTab: string | undefined): string | undefined {
  return urlTab === undefined ? undefined : (URL_TAB_TO_KIND[urlTab] ?? urlTab);
}
