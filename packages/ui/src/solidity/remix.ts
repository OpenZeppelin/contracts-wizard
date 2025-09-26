export function remixURL(code: string, upgradeable = false, overrideRemixURL?: string): URL {
  const remix = new URL(overrideRemixURL ?? 'https://remix.ethereum.org');

  const encodedCode = btoa(String.fromCharCode(...new TextEncoder().encode(code))).replace(/=*$/, '');

  remix.searchParams.set('code', encodedCode);

  if (upgradeable) {
    remix.searchParams.set('deployProxy', upgradeable.toString());
  }

  return remix;
}
