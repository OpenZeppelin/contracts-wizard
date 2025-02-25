import { OptionsError } from '../error';

/**
 * Converts to an identifier according to the rules in https://docs.cairo-lang.org/language_constructs/identifiers.html
 */
export function toIdentifier(str: string, capitalize = false): string {
  const result = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/^[^a-zA-Z_]+/, '')
    .replace(/^(.)/, c => (capitalize ? c.toUpperCase() : c))
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
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^\x20-\x7E]+/g, '') // remove non-ascii-printable characters
    .replace(/(\\|")/g, (_, c) => '\\' + c); // escape backslash or double quotes
}

/**
 * Converts to a felt252-compatible short string according to the rules in https://docs.cairo-lang.org/language_constructs/literal-expressions.html#short_string_literals
 */
export function toFelt252(str: string, field: string): string {
  const result = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
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

function maxValueOfUint(bits: number): bigint {
  if (bits <= 0) {
    throw new Error(`Number of bits must be positive (actual '${bits}').`);
  }
  if (bits % 8 !== 0) {
    throw new Error(`The number of bits must be a multiple of 8 (actual '${bits}').`);
  }
  const bytes = bits / 8;
  return BigInt('0x' + 'ff'.repeat(bytes));
}

const UINT_MAX_VALUES = {
  u8: maxValueOfUint(8),
  u16: maxValueOfUint(16),
  u32: maxValueOfUint(32),
  u64: maxValueOfUint(64),
  u128: maxValueOfUint(128),
  u256: maxValueOfUint(256),
} as const;

export type UintType = keyof typeof UINT_MAX_VALUES;

/**
 * Checks that a string/number value is a valid `uint` value and converts it to bigint
 */
export function toUint(value: number | string, field: string, type: UintType): bigint {
  const valueAsStr = value.toString();
  const isValidNumber = /^\d+$/.test(valueAsStr);
  if (!isValidNumber) {
    throw new OptionsError({
      [field]: 'Not a valid number',
    });
  }
  const numValue = BigInt(valueAsStr);
  if (numValue > UINT_MAX_VALUES[type]) {
    throw new OptionsError({
      [field]: `Value is greater than ${type} max value`,
    });
  }
  return numValue;
}

/**
 * Checks that a string/number value is a valid `uint` value
 */
export function validateUint(value: number | string, field: string, type: UintType): void {
  const _ = toUint(value, field, type);
}
