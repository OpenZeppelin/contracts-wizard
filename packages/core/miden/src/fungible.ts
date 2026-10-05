import type { CommonContractOptions, TransferPolicy } from './common-options';
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
import { toBaseUnits, toBaseUnitsExpression, toUint } from './utils/convert-strings';
import type { Lines } from './utils/format-lines';

/** Maximum number of decimals supported by fungible faucets (`FungibleFaucet::MAX_DECIMALS`). */
const MAX_DECIMALS = 12;

/** Maximum representable fungible asset amount in base units (`AssetAmount::MAX`). */
const MAX_ASSET_AMOUNT = 2n ** 63n - 2n ** 31n;

export const fungibleBurnPolicyOptions = ['anyHolder', 'minimumAmount', 'ownerOnly'] as const;

/**
 * Who can burn tokens, named after the standard burn policies of `miden-standards`.
 *
 * - `'anyHolder'`: any holder can burn their tokens (`BurnPolicy::allow_all`).
 * - `'minimumAmount'`: any holder can burn their tokens, at least `minBurnAmount` at a time
 *   (`BurnPolicy::min_burn_amount`).
 * - `'ownerOnly'`: only the faucet owner can burn the tokens it holds (`BurnPolicy::owner_only`).
 */
export type FungibleBurnPolicy = (typeof fungibleBurnPolicyOptions)[number];

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
  burnPolicy?: FungibleBurnPolicy;
  /** Minimum amount of tokens per burn. Required by, and only allowed with, the `'minimumAmount'` burn policy. */
  minBurnAmount?: string;
  pausable?: boolean;
  /** Whether pausing also stops transfers. Only applies when `pausable` is set; implied by a transfer policy. */
  pausableTransfers?: boolean;
  transferPolicy?: TransferPolicy;
  switchableTransferPolicy?: boolean;
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
  burnPolicy: 'anyHolder',
  minBurnAmount: '',
  pausable: false,
  pausableTransfers: false,
  transferPolicy: false,
  switchableTransferPolicy: false,
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
    maxSupply: opts.maxSupply ?? defaults.maxSupply,
    description: opts.description ?? defaults.description,
    logoUri: opts.logoUri ?? defaults.logoUri,
    externalLink: opts.externalLink ?? defaults.externalLink,
    updatableMetadata: opts.updatableMetadata ?? defaults.updatableMetadata,
    updatableMaxSupply: opts.updatableMaxSupply ?? defaults.updatableMaxSupply,
    burnPolicy: opts.burnPolicy ?? defaults.burnPolicy,
    minBurnAmount: opts.minBurnAmount ?? defaults.minBurnAmount,
    pausable: opts.pausable ?? defaults.pausable,
    pausableTransfers: opts.pausableTransfers ?? defaults.pausableTransfers,
    transferPolicy: opts.transferPolicy ?? defaults.transferPolicy,
    switchableTransferPolicy: opts.switchableTransferPolicy ?? defaults.switchableTransferPolicy,
  };
}

/**
 * The owner-only burn policy checks the faucet owner, which a Single Key faucet does not have, so it requires
 * an owner-based access control.
 */
export function isAccessControlRequired(opts: Partial<FungibleOptions>): boolean {
  return opts.burnPolicy === 'ownerOnly';
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
          validateMinBurnAmount(allOpts.minBurnAmount, decimals, maxSupply, allOpts.burnPolicy),
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

  const access =
    isAccessControlRequired(allOpts) && allOpts.access === 'singleKey' ? DEFAULT_ACCESS_CONTROL : allOpts.access;

  addFaucetComponent(c, allOpts, decimals);

  if (minBurnAmount !== null) {
    c.addConstant({
      name: 'MIN_BURN_AMOUNT',
      type: 'u64',
      value: toBaseUnitsExpression(allOpts.minBurnAmount),
      comments: [],
    });
  }

  addFaucetAccount(c, access, {
    kind: 'Fungible',
    burnPolicy: allOpts.burnPolicy,
    pausable: allOpts.pausable,
    pausableTransfers: allOpts.pausable && allOpts.pausableTransfers,
    transferPolicy: allOpts.transferPolicy,
    switchableTransferPolicy: allOpts.switchableTransferPolicy,
    updatableMetadata: allOpts.updatableMetadata || allOpts.updatableMaxSupply,
  });

  setInfo(c, allOpts.info);

  return c;
}

function validateDecimals(decimals: string): number {
  const value = toUint(decimals, 'decimals', 'u8');
  if (value > BigInt(MAX_DECIMALS)) {
    throw new OptionsError({ decimals: `Must be at most ${MAX_DECIMALS}` });
  }
  return Number(value);
}

function validateMaxSupply(maxSupply: string, decimals: number): bigint {
  // The max supply caps minting for good unless it is updatable, so an empty value is an error rather than the default
  if (maxSupply.trim() === '') {
    throw new OptionsError({ maxSupply: 'Max supply is required' });
  }
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
 * Validates the minimum burn amount of the `'minimumAmount'` burn policy and converts it to base units. Returns
 * `null` for the other burn policies, which take no minimum.
 */
function validateMinBurnAmount(
  minBurnAmount: string,
  decimals: number,
  maxSupply: bigint,
  burnPolicy: FungibleBurnPolicy,
): bigint | null {
  const trimmed = minBurnAmount.trim();
  if (burnPolicy !== 'minimumAmount') {
    if (trimmed.length > 0) {
      throw new OptionsError({ minBurnAmount: 'Requires the Minimum Amount burn policy' });
    }
    return null;
  }
  if (trimmed.length === 0) {
    throw new OptionsError({
      minBurnAmount: 'Minimum burn amount is required when using the Minimum Amount burn policy',
    });
  }
  const baseUnits = BigInt(toBaseUnits(trimmed, decimals, 'minBurnAmount'));
  if (baseUnits === 0n) {
    throw new OptionsError({ minBurnAmount: 'Must be greater than 0' });
  }
  if (baseUnits > maxSupply) {
    throw new OptionsError({ minBurnAmount: 'Must not exceed the max supply' });
  }
  return baseUnits;
}

function addFaucetComponent(c: ContractBuilder, opts: Required<FungibleOptions>, decimals: number) {
  c.addUseClause('miden_protocol::asset', 'AssetAmount');
  c.addUseClause('miden_protocol::asset', 'TokenSymbol');
  c.addUseClause('miden_standards::account::faucets', 'FungibleFaucet');
  c.addUseClause('miden_standards::account::faucets', 'TokenName');

  addStringConstant(c, 'NAME', opts.name);
  addStringConstant(c, 'SYMBOL', opts.symbol);
  c.addConstant({
    name: 'DECIMALS',
    type: 'u8',
    value: decimals.toString(),
    comments: [],
  });
  c.addConstant({
    name: 'MAX_SUPPLY',
    type: 'u64',
    value: toBaseUnitsExpression(opts.maxSupply),
    comments: [],
  });

  const chain: Lines[] = [
    '.name(TokenName::new(Self::NAME).expect("token name should be valid"))',
    '.symbol(TokenSymbol::new(Self::SYMBOL).expect("token symbol should be valid"))',
    '.decimals(Self::DECIMALS)',
    '.max_supply(AssetAmount::new(Self::MAX_SUPPLY).expect("max supply should be valid"))',
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
        expect: 'external link should be valid',
      },
    ),
  ];
  if (opts.updatableMaxSupply) {
    chain.push('.is_max_supply_mutable(true)');
  }
  chain.push('.build()', '.expect("faucet configuration should be valid")');

  c.addFunction({
    name: 'faucet',
    comments: [],
    args: [],
    returns: 'FungibleFaucet',
    code: ['FungibleFaucet::builder()', chain],
    pub: true,
  });
}
