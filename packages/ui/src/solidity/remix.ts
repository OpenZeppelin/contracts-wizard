export function remixURL(code: string, upgradeable = false): URL {
  const remix = new URL('https://remix.ethereum.org');

  // Encode to base64 in a way that works in both browser and Node.
  const encodedCode = ((): string => {
    // Prefer browser btoa when available
    if (typeof (globalThis as any).btoa === 'function') {
      const bytes = new TextEncoder().encode(code);
      const binary = String.fromCharCode(...bytes);
      return (globalThis as any).btoa(binary).replace(/=*$/, '');
    }
    // Fallback to Node Buffer
    return Buffer.from(code, 'utf8').toString('base64').replace(/=*$/, '');
  })();

  remix.searchParams.set('code', encodedCode);

  if (upgradeable) {
    remix.searchParams.set('deployProxy', upgradeable.toString());
  }

  return remix;
}
