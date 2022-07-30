export function remixURL(code: string, upgradable = false): URL {
  const remix = new URL('https://remix.ethereum.org');
  remix.searchParams.set('code', btoa(code).replace(/=*$/, ''));
  if (upgradable) {
    remix.searchParams.set('deployProxy', upgradable.toString());
  }
  return remix;
}
