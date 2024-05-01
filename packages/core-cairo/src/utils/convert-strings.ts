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
export function toByteArray(str: string): string {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^\x20-\x7E]+/g, '') // remove non-ascii-printable characters
    .replace(/(\\|")/g, (_, c) => '\\' + c); // escape backslash or double quotes
}

/**
 * Converts to a felt252-compatible short string according to the rules in https://docs.cairo-lang.org/language_constructs/literal-expressions.html#short_string_literals
 */
export function toFelt252(str: string, field: string): string {
  const result = str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^\x20-\x7E]+/g, '') // remove non-ascii-printable characters
    .replace(/(\\|')/g, (_, c) => '\\' + c); // escape backslash or single quote

  if (result.length > 31) {
    throw new OptionsError({
      [field]: 'String is longer than 31 characters',
    });
  } else {
    return result;
  }
}