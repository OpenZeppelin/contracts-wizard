import { OptionsError } from "../error";

/**
 * Converts to an identifier according to the rules in https://docs.cairo-lang.org/language_constructs/identifiers.html
 */
export function toIdentifier(str: string, capitalize = false): string {
  const result = str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/^[^a-zA-Z_]+/, '')
    .replace(/^(.)/, c => capitalize ? c.toUpperCase() : c)
    .replace(/[^\w]+(.?)/g, (_, c) => c.toUpperCase());

  if (result.length === 0) {
    throw new OptionsError({
      name: 'Identifier is empty or does not have valid characters',
    });
  } else {
    return result;
  }
}

/**
 * Converts to a ByteArray compatible string literal
 */
export function toStringLiteral(str: string): string {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^\x20-\x7E]+/g, '') // remove non-ascii-printable characters
    .replace(/(\\|")/g, (_, c) => '\\' + c); // escape backslash or double quotes
}