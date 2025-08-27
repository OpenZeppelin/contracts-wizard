export function remixURL(code: string, upgradeable = false): URL {
  const remix = new URL('https://remix.ethereum.org');

  const codeWithEscapedSpecialCharacters = Array.from(new TextEncoder().encode(code), b => String.fromCharCode(b)).join(
    '',
  );

  remix.searchParams.set('code', btoa(codeWithEscapedSpecialCharacters).replace(/=*$/, ''));

  if (upgradeable) {
    remix.searchParams.set('deployProxy', upgradeable.toString());
  }

  return remix;
}
