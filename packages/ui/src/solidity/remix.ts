export function remixURL(code: string, upgradeable = false, overrideRemixURL?: string): URL {
  const remix = new URL(overrideRemixURL ?? 'https://remix.ethereum.org');

  // TODO: open issue in Polkadot Remix for escaped special characters
  const codeWithEscapedSpecialCharacters = Array.from(new TextEncoder().encode(code), b => String.fromCharCode(b)).join(
    '',
  );

  remix.searchParams.set('code', btoa(codeWithEscapedSpecialCharacters).replace(/=*$/, ''));

  if (upgradeable) {
    remix.searchParams.set('deployProxy', upgradeable.toString());
  }

  return remix;
}
