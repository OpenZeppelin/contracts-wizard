export function remixURL(code: string): URL {
  const remix = new URL('https://remix.ethereum.org');
  remix.searchParams.set('code', btoa(code).replace(/=*$/, ''));
  return remix;
}
