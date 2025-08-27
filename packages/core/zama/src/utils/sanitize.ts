export function stringifyUnicodeSafe(str: string): string {
  // eslint-disable-next-line no-control-regex
  const containsUnicode = /[^\x00-\x7F]/.test(str);

  return containsUnicode ? `unicode"${str.replace(/"/g, '\\"')}"` : JSON.stringify(str);
}
