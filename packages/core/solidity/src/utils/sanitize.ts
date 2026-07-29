/**
 * Returns a Solidity string literal whose decoded value is `str`.
 *
 * The form is chosen from Solidity's grammar (see
 * https://docs.soliditylang.org/en/latest/grammar.html):
 *
 * - For input that fits the regular `"..."` literal (DoubleQuotedPrintable =
 *   printable ASCII 0x20-0x7E minus `"` and `\`), only `"` and `\` need escaping.
 * - Otherwise, `unicode"..."` is used. The grammar excludes `"`, CR, LF, `\`
 *   from the raw body; vertical tab (0x0B) is escaped too because Solidity's
 *   lexer treats it as a line terminator. Non-BMP characters pass through as
 *   raw UTF-8 (no surrogate escapes).
 */
export function stringifyUnicodeSafe(str: string): string {
  const needsUnicode = /[^\x20-\x7E]/u.test(str);
  if (!needsUnicode) {
    return `"${str.replace(/[\\"]/g, '\\$&')}"`;
  }
  // eslint-disable-next-line no-control-regex
  const body = str.replace(/[\\"\r\n\x0b]/gu, c =>
    c === '"' ? '\\"' : c === '\\' ? '\\\\' : c === '\n' ? '\\n' : c === '\r' ? '\\r' : '\\x0b',
  );
  return `unicode"${body}"`;
}
