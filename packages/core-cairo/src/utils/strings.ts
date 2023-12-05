/**
 * Converts to an identifier according to the rules in https://docs.cairo-lang.org/language_constructs/identifiers.html
 */
export function toIdentifier(str: string, capitalize = false): string {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/^[^a-zA-Z_]+/, '')
    .replace(/^(.)/, c => capitalize ? c.toUpperCase() : c)
    .replace(/[^\w]+(.?)/g, (_, c) => c.toUpperCase());
}

/**
 * Converts to a felt252-compatible short string according to the rules in https://docs.cairo-lang.org/language_constructs/literal-expressions.html#short_string_literals
 */
export function toPrintableShortString(str: string): string {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^\x20-\x7E]+/g, '') // remove non-ascii-printable characters
    .replace(/(\\|')/g, (_, c) => '\\' + c) // escape backslash or single quote
    .slice(0, 31); // limit to 31 characters
}