// UTF-8-safe base64 without trailing padding, shared by the web-IDE deep links
// (Remix and TRON IDE). Both IDEs decode with atob, which accepts unpadded input.
export const encodeUtf8Base64 = (str: string): string =>
  btoa(String.fromCharCode(...new TextEncoder().encode(str))).replace(/=*$/, '');

export function remixURL(code: string, remappings: string[] = [], upgradeable = false): URL {
  const remix = new URL('https://remix.ethereum.org');

  const hashParams = new URLSearchParams();

  hashParams.set('code', encodeUtf8Base64(code));

  if (remappings.length > 0) {
    hashParams.set('remaps', encodeUtf8Base64(remappings.join('\n')));
  }

  if (upgradeable) {
    hashParams.set('deployProxy', upgradeable.toString());
  }

  remix.hash = hashParams.toString();

  return remix;
}
