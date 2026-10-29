import { OptionsError } from '../error';

/**
 * Throws an OptionsError if `str` cannot round-trip through Solidity's lexer:
 *
 *  - ASCII control characters 0x00-0x1F (including TAB, LF, CR, VT, FF) and
 *    DEL (0x7F).
 *  - Unicode line terminators that Solidity's scanner recognises outside the
 *    ASCII control range: NEL (U+0085), LS (U+2028), PS (U+2029).
 *    See liblangutil/Scanner.cpp::isUnicodeLinebreak in the Solidity source.
 *  - Lone UTF-16 surrogates (U+D800-U+DFFF without a pair) — not representable
 *    as valid UTF-8.
 *
 * The error attributes to `fieldName`, so callers should pass the option key
 * the input came from (e.g. 'name', 'symbol', 'uri').
 */
export function validateSolidityString(str: string, fieldName: string): void {
  for (const ch of str) {
    const cp = ch.codePointAt(0)!;
    if (cp <= 0x1f || cp === 0x7f || cp === 0x85 || cp === 0x2028 || cp === 0x2029) {
      throw new OptionsError({
        [fieldName]: `Unsupported character U+${cp.toString(16).toUpperCase().padStart(4, '0')}`,
      });
    }
    if (cp >= 0xd800 && cp <= 0xdfff) {
      throw new OptionsError({
        [fieldName]: `Unpaired surrogate U+${cp.toString(16).toUpperCase()}`,
      });
    }
  }
}

/**
 * Returns a Solidity string literal whose decoded value is `str`.
 *
 * Prefer validating with `validateSolidityString` at the option-receiving layer
 * so callers get an OptionsError at the build boundary. This helper still
 * escapes `"`, `\`, CR, LF and VT so a missed validation cannot inject a line
 * terminator into a unicode literal body.
 *
 * The form is chosen from Solidity's grammar (see
 * https://docs.soliditylang.org/en/latest/grammar.html):
 *
 * - For input that fits the regular `"..."` literal (DoubleQuotedPrintable =
 *   printable ASCII 0x20-0x7E minus `"` and `\`), only `"` and `\` need escaping.
 * - Otherwise, `unicode"..."` is used. Non-BMP characters pass through as
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
