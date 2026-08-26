export function remixURL(code: string, remappings: string[] = [], upgradeable = false): URL {
  const remix = new URL('https://remix.ethereum.org');

  const encodeBase64 = (str: string) => btoa(String.fromCharCode(...new TextEncoder().encode(str))).replace(/=*$/, '');

  const hashParams = new URLSearchParams();

  hashParams.set('code', encodeBase64(code));

  if (remappings.length > 0) {
    hashParams.set('remaps', encodeBase64(remappings.join('\n')));
  }

  if (upgradeable) {
    hashParams.set('deployProxy', upgradeable.toString());
  }

  remix.hash = hashParams.toString();

  return remix;
}
