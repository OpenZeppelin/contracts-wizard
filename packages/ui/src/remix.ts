export function remixURL(code: string, upgradeable = false): URL {
  const remix = new URL('https://remix.ethereum.org');
  remix.searchParams.set('code', btoa(code).replace(/=*$/, ''));
  if (upgradeable) {
    remix.searchParams.set('deployProxy', upgradeable.toString());
  }
  return remix;
}
