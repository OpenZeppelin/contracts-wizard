import type { ContractBuilder } from './contract';
import type { OptionsErrorMessages } from './error';
import { OptionsError } from './error';
import { escapeString, utf8ByteLength } from './utils/convert-strings';

/** Maximum length of a token name in bytes when encoded as UTF-8 (`TokenName::MAX_BYTES`). */
export const MAX_TOKEN_NAME_BYTES = 32;

/** Maximum number of characters of a token symbol (`TokenSymbol::MAX_SYMBOL_LENGTH`). */
export const MAX_TOKEN_SYMBOL_LENGTH = 12;

/** Token symbols are 1 to 12 uppercase ASCII letters. */
export const symbolPattern = /^[A-Z]{1,12}$/;

/** Maximum length of the description, logo URI and external link in bytes when encoded as UTF-8. */
export const MAX_METADATA_FIELD_BYTES = 195;

export function validateName(name: string, errors: OptionsErrorMessages): void {
  if (utf8ByteLength(name) > MAX_TOKEN_NAME_BYTES) {
    errors.name = `Must be at most ${MAX_TOKEN_NAME_BYTES} bytes when encoded as UTF-8`;
  }
}

export function validateSymbol(symbol: string, errors: OptionsErrorMessages): void {
  if (!symbolPattern.test(symbol)) {
    errors.symbol = `Must be 1 to ${MAX_TOKEN_SYMBOL_LENGTH} uppercase ASCII letters`;
  }
}

export function validateMetadataField(value: string, field: string, errors: OptionsErrorMessages): void {
  if (utf8ByteLength(value) > MAX_METADATA_FIELD_BYTES) {
    errors[field] = `Must be at most ${MAX_METADATA_FIELD_BYTES} bytes when encoded as UTF-8`;
  }
}

/**
 * Runs a validation that throws an `OptionsError`, collecting its messages into `errors` instead of throwing.
 * Returns `undefined` when the validation failed.
 */
export function collectErrors<T>(errors: OptionsErrorMessages, validate: () => T): T | undefined {
  try {
    return validate();
  } catch (e: unknown) {
    if (e instanceof OptionsError) {
      Object.assign(errors, e.messages);
      return undefined;
    }
    throw e;
  }
}

export function addStringConstant(c: ContractBuilder, name: string, value: string): void {
  c.addConstant({
    name,
    type: "&'static str",
    value: `"${escapeString(value)}"`,
    comments: [],
  });
}

export interface OptionalMetadata {
  description: string;
  logoUri: string;
  /** External link of a fungible token or contract URI of an NFT collection. */
  link: string;
  updatable: boolean;
}

/**
 * Adds the constants and builder calls for the optional token metadata fields shared by fungible and
 * non-fungible faucets. Returns the builder method calls to append to the faucet builder chain.
 */
export function addOptionalMetadata(
  c: ContractBuilder,
  metadata: OptionalMetadata,
  link: { constant: string; method: string; mutabilityMethod: string; expect: string },
): string[] {
  const calls: string[] = [];

  if (metadata.description) {
    c.addUseClause('miden_standards::account::faucets', 'Description');
    addStringConstant(c, 'DESCRIPTION', metadata.description);
    calls.push('.description(Description::new(Self::DESCRIPTION).expect("description is valid"))');
  }

  if (metadata.logoUri) {
    c.addUseClause('miden_standards::account::faucets', 'LogoURI');
    addStringConstant(c, 'LOGO_URI', metadata.logoUri);
    calls.push('.logo_uri(LogoURI::new(Self::LOGO_URI).expect("logo URI is valid"))');
  }

  if (metadata.link) {
    c.addUseClause('miden_standards::account::faucets', 'ExternalLink');
    addStringConstant(c, link.constant, metadata.link);
    calls.push(`.${link.method}(ExternalLink::new(Self::${link.constant}).expect("${link.expect}"))`);
  }

  if (metadata.updatable) {
    calls.push('.is_description_mutable(true)', '.is_logo_uri_mutable(true)', `.${link.mutabilityMethod}(true)`);
  }

  return calls;
}
