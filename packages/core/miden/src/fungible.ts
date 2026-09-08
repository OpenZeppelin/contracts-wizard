import type { CommonContractOptions, Restrictions } from './common-options';
import {
  contractDefaults as commonDefaults,
  DEFAULT_ACCESS_CONTROL,
  withCommonContractDefaults,
} from './common-options';
import type { Contract } from './contract';
import { ContractBuilder } from './contract';
import type { OptionsErrorMessages } from './error';
import { OptionsError } from './error';
import { addFaucetAccount } from './faucet-account';
import { printContract } from './print';
import { setInfo } from './set-info';
import {
  addOptionalMetadata,
  addStringConstant,
  collectErrors,
  validateMetadataField,
  validateName,
  validateSymbol,
} from './token-metadata';
import { toBaseUnits, toRustIntegerLiteral, toUint } from './utils/convert-strings';
import { paragraph } from './utils/doc';

/** Maximum number of decimals supported by fungible faucets (`FungibleFaucet::MAX_DECIMALS`). */
export const MAX_DECIMALS = 12;

/** Maximum representable fungible asset amount in base units (`AssetAmount::MAX`). */
export const MAX_ASSET_AMOUNT = 2n ** 63n - 2n ** 31n;

export interface FungibleOptions extends CommonContractOptions {
  name: string;
  symbol: string;
  decimals?: string;
  maxSupply?: string;
  description?: string;
  logoUri?: string;
  externalLink?: string;
  updatableMetadata?: boolean;
  updatableMaxSupply?: boolean;
  burnable?: boolean;
  minBurnAmount?: string;
  pausable?: boolean;
  restrictions?: Restrictions;
  switchablePolicies?: boolean;
}

export const defaults: Required<FungibleOptions> = {
  name: 'MyToken',
  symbol: 'MTK',
  decimals: '8',
  maxSupply: '1000000000',
  description: '',
  logoUri: '',
  externalLink: '',
  updatableMetadata: false,
  updatableMaxSupply: false,
  burnable: true,
  minBurnAmount: '',
  pausable: false,
  restrictions: false,
  switchablePolicies: false,
  access: commonDefaults.access,
  info: commonDefaults.info,
} as const;

export function printFungible(opts: FungibleOptions = defaults): string {
  return printContract(buildFungible(opts));
}

function withDefaults(opts: FungibleOptions): Required<FungibleOptions> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    decimals: opts.decimals || defaults.decimals,
    maxSupply: opts.maxSupply || defaults.maxSupply,
    description: opts.description ?? defaults.description,
    logoUri: opts.logoUri ?? defaults.logoUri,
    externalLink: opts.externalLink ?? defaults.externalLink,
    updatableMetadata: opts.updatableMetadata ?? defaults.updatableMetadata,
    updatableMaxSupply: opts.updatableMaxSupply ?? defaults.updatableMaxSupply,
    burnable: opts.burnable ?? defaults.burnable,
    minBurnAmount: opts.minBurnAmount ?? defaults.minBurnAmount,
    pausable: opts.pausable ?? defaults.pausable,
    restrictions: opts.restrictions ?? defaults.restrictions,
    switchablePolicies: opts.switchablePolicies ?? defaults.switchablePolicies,
  };
}

/**
 * Restricting burning to the owner requires an owner, so access control is required when the token is not
 * burnable by its holders.
 */
export function isAccessControlRequired(opts: Partial<FungibleOptions>): boolean {
  return opts.burnable === false;
}

export function buildFungible(opts: FungibleOptions): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  const errors: OptionsErrorMessages = {};
  validateName(allOpts.name, errors);
  validateSymbol(allOpts.symbol, errors);
  const decimals = collectErrors(errors, () => validateDecimals(allOpts.decimals));
  const maxSupply =
    decimals === undefined ? undefined : collectErrors(errors, () => validateMaxSupply(allOpts.maxSupply, decimals));
  const minBurnAmount =
    decimals === undefined || maxSupply === undefined
      ? undefined
      : collectErrors(errors, () =>
          validateMinBurnAmount(allOpts.minBurnAmount, decimals, maxSupply, allOpts.burnable),
        );
  validateMetadataField(allOpts.description, 'description', errors);
  validateMetadataField(allOpts.logoUri, 'logoUri', errors);
  validateMetadataField(allOpts.externalLink, 'externalLink', errors);
  if (
    Object.keys(errors).length > 0 ||
    decimals === undefined ||
    maxSupply === undefined ||
    minBurnAmount === undefined
  ) {
    throw new OptionsError(errors);
  }

  const access = allOpts.burnable ? allOpts.access : allOpts.access || DEFAULT_ACCESS_CONTROL;

  addFaucetComponent(c, allOpts, decimals, maxSupply);

  if (minBurnAmount !== null) {
    c.addConstant({
      name: 'MIN_BURN_AMOUNT',
      type: 'u64',
      value: toRustIntegerLiteral(minBurnAmount),
      comments: paragraph(
        `Minimum amount that can be burned at once, in base units (${describeAmount(allOpts.minBurnAmount, decimals)}).`,
        1,
      ),
    });
  }

  addFaucetAccount(c, access, {
    kind: 'Fungible',
    burnable: allOpts.burnable,
    minBurnAmount: minBurnAmount === null ? undefined : allOpts.minBurnAmount.trim(),
    pausable: allOpts.pausable,
    restrictions: allOpts.restrictions,
    switchablePolicies: allOpts.switchablePolicies,
    updatableMetadata: allOpts.updatableMetadata || allOpts.updatableMaxSupply,
  });

  setInfo(c, allOpts.info);

  return c;
}

/** Describes a validated token amount for documentation, e.g. `1000 tokens with 8 decimals`. */
function describeAmount(amount: string, decimals: number): string {
  const trimmed = amount.trim();
  const tokens = Number(trimmed) === 1 ? 'token' : 'tokens';
  const places = decimals === 1 ? 'decimal' : 'decimals';
  return `${trimmed} ${tokens} with ${decimals} ${places}`;
}

function validateDecimals(decimals: string): number {
  const value = toUint(decimals, 'decimals', 'u8');
  if (value > BigInt(MAX_DECIMALS)) {
    throw new OptionsError({ decimals: `Must be at most ${MAX_DECIMALS}` });
  }
  return Number(value);
}

function validateMaxSupply(maxSupply: string, decimals: number): bigint {
  const baseUnits = BigInt(toBaseUnits(maxSupply, decimals, 'maxSupply'));
  if (baseUnits === 0n) {
    throw new OptionsError({ maxSupply: 'Must be greater than 0' });
  }
  if (baseUnits > MAX_ASSET_AMOUNT) {
    throw new OptionsError({ maxSupply: 'Exceeds the maximum fungible asset amount' });
  }
  return baseUnits;
}

/**
 * Validates the minimum burn amount and converts it to base units. Returns `null` when no minimum is set.
 */
function validateMinBurnAmount(
  minBurnAmount: string,
  decimals: number,
  maxSupply: bigint,
  burnable: boolean,
): bigint | null {
  if (minBurnAmount.trim().length === 0) {
    return null;
  }
  const baseUnits = BigInt(toBaseUnits(minBurnAmount, decimals, 'minBurnAmount'));
  if (baseUnits === 0n) {
    return null;
  }
  if (baseUnits > maxSupply) {
    throw new OptionsError({ minBurnAmount: 'Must not exceed the max supply' });
  }
  if (!burnable) {
    throw new OptionsError({
      minBurnAmount: 'Requires the token to be burnable by its holders',
      burnable: 'Owner-only burning cannot have a minimum burn amount',
    });
  }
  return baseUnits;
}

function addFaucetComponent(c: ContractBuilder, opts: Required<FungibleOptions>, decimals: number, maxSupply: bigint) {
  c.addUseClause('miden_protocol::asset', 'AssetAmount');
  c.addUseClause('miden_protocol::asset', 'TokenSymbol');
  c.addUseClause('miden_standards::account::faucets', 'FungibleFaucet');
  c.addUseClause('miden_standards::account::faucets', 'TokenName');

  addStringConstant(c, 'NAME', opts.name, 'Token name.');
  addStringConstant(c, 'SYMBOL', opts.symbol, 'Token symbol.');
  c.addConstant({
    name: 'DECIMALS',
    type: 'u8',
    value: decimals.toString(),
    comments: ['Number of decimals used to represent token amounts.'],
  });
  c.addConstant({
    name: 'MAX_SUPPLY',
    type: 'u64',
    value: toRustIntegerLiteral(maxSupply),
    comments: paragraph(`Maximum token supply in base units (${describeAmount(opts.maxSupply, decimals)}).`, 1),
  });

  const chain: string[] = [
    '.name(TokenName::new(Self::NAME).expect("token name is valid"))',
    '.symbol(TokenSymbol::new(Self::SYMBOL).expect("token symbol is valid"))',
    '.decimals(Self::DECIMALS)',
    '.max_supply(AssetAmount::new(Self::MAX_SUPPLY).expect("max supply is valid"))',
    ...addOptionalMetadata(
      c,
      {
        description: opts.description,
        logoUri: opts.logoUri,
        link: opts.externalLink,
        updatable: opts.updatableMetadata,
      },
      {
        constant: 'EXTERNAL_LINK',
        method: 'external_link',
        mutabilityMethod: 'is_external_link_mutable',
        comment: 'Link to more information about the token.',
        expect: 'external link is valid',
      },
      'Token',
    ),
  ];
  if (opts.updatableMaxSupply) {
    chain.push('.is_max_supply_mutable(true)');
  }
  chain.push('.build()', '.expect("faucet configuration is valid")');

  c.addFunction({
    name: 'faucet',
    comments: paragraph('Returns the fungible faucet component holding the token configuration and metadata.', 1),
    args: [],
    returns: 'FungibleFaucet',
    code: ['FungibleFaucet::builder()', chain],
    pub: true,
  });
}
