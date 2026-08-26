// UTF-8-safe base64 without trailing padding, the same encoding `remixURL`
// uses; TRON IDE's atob decode accepts unpadded input.
const encodeUtf8Base64 = (str: string): string =>
  btoa(String.fromCharCode(...new TextEncoder().encode(str))).replace(/=*$/, '');

// TRON IDE (https://tronide.io, a Remix fork) reads hash params raw — no
// decodeURIComponent — and decodes `code`/`remaps` with plain atob. The base64
// payloads must therefore be written into the hash verbatim: percent-encoding
// them the way URLSearchParams does (`+` -> `%2B`, `/` -> `%2F`) makes atob
// throw and the contract silently fails to load. Every base64 character is
// valid in a URL fragment, so raw assembly is safe.
export function tronIdeURL(code: string, remappings: string[] = [], upgradeable = false): URL {
  const hashParams = [`code=${encodeUtf8Base64(code)}`];

  if (remappings.length > 0) {
    // Ignored by TRON IDE today (imports resolve through npm's `latest` tag);
    // kept versioned so existing links start pinning the library the day the
    // IDE adopts Remix's `remaps` param.
    hashParams.push(`remaps=${encodeUtf8Base64(remappings.join('\n'))}`);
  }

  if (upgradeable) {
    // Also ignored by TRON IDE today (it has no proxy deployment); kept for
    // forward compatibility since this is the param Remix consumes.
    hashParams.push('deployProxy=true');
  }

  const tronIde = new URL('https://tronide.io');
  tronIde.hash = hashParams.join('&');

  return tronIde;
}

// TRON IDE's atob-only decode reads each UTF-8 byte as a Latin-1 character, so
// any non-ASCII character (e.g. a unicode token name) is silently corrupted in
// the loaded source — which still compiles, baking the mojibake into on-chain
// state. The "Open in TRON IDE" action is disabled for such sources.
export function containsNonAscii(code: string): boolean {
  // \u0080-\uFFFF covers all non-ASCII: astral characters (e.g. emoji) are
  // surrogate pairs in JS strings, which fall inside this range.
  return /[\u0080-\uFFFF]/.test(code);
}
