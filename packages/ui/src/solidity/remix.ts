export function remixURL(code: string, upgradeable = false): URL {
  const remix = new URL('https://remix.ethereum.org');

  const encodedCode = btoa(String.fromCharCode(...new TextEncoder().encode(code))).replace(/=*$/, '');

  remix.searchParams.set('code', encodedCode);

  if (upgradeable) {
    remix.searchParams.set('deployProxy', upgradeable.toString());
  }

  return remix;
}
