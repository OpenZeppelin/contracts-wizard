import { ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { requireAccessControl, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { addUpgradeable } from './add-upgradeable';
import { addVotes } from './add-votes';
import { defineFunctions } from './utils/define-functions';
import type { CommonContractOptions } from './common-options';
import { withCommonContractDefaults, getSelfArg } from './common-options';
import { setInfo } from './set-info';
import { OptionsError } from './error';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { toByteArray, toUint } from './utils/convert-strings';
import { printComposedContractType } from './utils/compose';
import { pickKeys } from '@openzeppelin/wizard-common';

const DEFAULT_DECIMALS = 7;

export const defaults: Required<FungibleOptions> = {
  name: 'MyToken',
  symbol: 'MTK',
  decimals: DEFAULT_DECIMALS.toString(),
  burnable: false,
  votes: false,
  totalSupply: false,
  cap: '',
  pausable: false,
  upgradeable: false,
  premint: '0',
  mintable: false,
  access: commonDefaults.access,
  info: commonDefaults.info,
  explicitImplementations: commonDefaults.explicitImplementations,
} as const;

export function printFungible(opts: FungibleOptions = defaults): string {
  return printContract(buildFungible(opts));
}

export interface FungibleOptions extends CommonContractOptions {
  name: string;
  symbol: string;
  decimals?: string;
  burnable?: boolean;
  votes?: boolean;
  totalSupply?: boolean;
  cap?: string;
  pausable?: boolean;
  upgradeable?: boolean;
  premint?: string;
  mintable?: boolean;
}

/**
 * Contract type restricting which accounts can use the token, selected by the Stablecoin limitations.
 */
export type TransferPolicy = 'AllowList' | 'BlockList';

export function withDefaults(opts: FungibleOptions): Required<FungibleOptions> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    decimals: opts.decimals ?? defaults.decimals,
    burnable: opts.burnable ?? defaults.burnable,
    votes: opts.votes ?? defaults.votes,
    totalSupply: opts.totalSupply ?? defaults.totalSupply,
    cap: opts.cap ?? defaults.cap,
    pausable: opts.pausable ?? defaults.pausable,
    upgradeable: opts.upgradeable ?? defaults.upgradeable,
    premint: opts.premint || defaults.premint,
    mintable: opts.mintable ?? defaults.mintable,
  };
}

export function isAccessControlRequired(opts: Partial<FungibleOptions>): boolean {
  return opts.mintable === true || opts.pausable === true || opts.upgradeable === true;
}

export function buildFungible(opts: FungibleOptions): ContractBuilder {
  return buildFungibleWithTransferPolicy(opts);
}

/**
 * Builds a Fungible contract whose contract type also includes the given transfer policy.
 */
export function buildFungibleWithTransferPolicy(
  opts: FungibleOptions,
  transferPolicy?: TransferPolicy,
): ContractBuilder {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  const decimals = toUint(allOpts.decimals, 'decimals', 'u32');

  const capped = allOpts.cap !== '';
  // The cap is checked against the total supply, so it requires the supply to be tracked.
  const totalSupply = allOpts.totalSupply || capped;

  if (allOpts.votes && capped) {
    throw new OptionsError({
      votes: 'Votes extension cannot be used with a cap',
      cap: 'Cap cannot be used with Votes extension',
    });
  }

  if (allOpts.votes && totalSupply) {
    throw new OptionsError({
      votes: 'Votes extension cannot be used with Total Supply extension',
      totalSupply: 'Total Supply extension cannot be used with Votes extension',
    });
  }

  // Order follows the library's documentation, e.g. `Compose<(AllowList, Capped, TotalSupply)>`.
  const contractTypes = [
    ...(transferPolicy ? [transferPolicy] : []),
    ...(allOpts.votes ? ['FungibleVotes'] : []),
    ...(capped ? ['Capped'] : []),
    ...(totalSupply ? ['TotalSupply'] : []),
  ];

  addBase(
    c,
    toByteArray(allOpts.name),
    toByteArray(allOpts.symbol),
    decimals,
    contractTypes,
    allOpts.pausable,
    allOpts.explicitImplementations,
  );

  if (allOpts.votes) {
    addVotes(c, allOpts.explicitImplementations);
  }

  if (totalSupply) {
    addTotalSupply(c, allOpts.explicitImplementations);
  }

  // The cap has to be set before the premint, which is checked against it.
  const capAbsolute = capped ? addCap(c, allOpts.cap, decimals, allOpts.explicitImplementations) : undefined;

  if (allOpts.premint) {
    addPremint(c, allOpts.premint, decimals, capAbsolute);
  }

  if (allOpts.pausable) {
    addPausable(c, allOpts.access, allOpts.explicitImplementations);
  }

  if (allOpts.upgradeable) {
    addUpgradeable(c, allOpts.access, allOpts.explicitImplementations);
  }

  if (allOpts.burnable) {
    addBurnable(c, allOpts.pausable, allOpts.explicitImplementations);
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.access, allOpts.pausable, allOpts.explicitImplementations);
  }

  setAccessControl(c, allOpts.access, allOpts.explicitImplementations);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(
  c: ContractBuilder,
  name: string,
  symbol: string,
  decimals: bigint,
  contractTypes: string[],
  pausable: boolean,
  explicitImplementations: boolean,
) {
  // Set metadata
  c.addConstructorCode(
    `Base::set_metadata(e, ${decimals}, String::from_str(e, "${name}"), String::from_str(e, "${symbol}"));`,
  );

  // Set token functions
  c.addUseClause('stellar_tokens::fungible', 'Base');
  c.addUseClause('stellar_tokens::fungible', 'Compose');
  c.addUseClause('stellar_tokens::fungible', 'FungibleToken');
  if (contractTypes.includes('FungibleVotes')) {
    c.addUseClause('stellar_tokens::fungible', 'votes::FungibleVotes');
  }
  c.addUseClause('soroban_sdk', 'contract');
  c.addUseClause('soroban_sdk', 'contractimpl');
  c.addUseClause('soroban_sdk', 'String');
  c.addUseClause('soroban_sdk', 'Symbol');
  c.addUseClause('soroban_sdk', 'Env');
  c.addUseClause('soroban_sdk', 'Address');
  c.addUseClause('soroban_sdk', 'MuxedAddress');
  c.addUseClause('soroban_sdk', 'Vec');

  const fungibleTokenTrait = {
    traitName: 'FungibleToken',
    structName: c.name,
    tags: explicitImplementations ? ['contractimpl'] : ['contractimpl(contracttrait)'],
    assocType: printComposedContractType(contractTypes.length > 0 ? contractTypes : ['Base']),
  };

  c.addTraitImplBlock(fungibleTokenTrait);

  if (explicitImplementations) c.addTraitForEachFunctions(fungibleTokenTrait, fungibleTokenTraitFunctions);

  if (pausable) {
    c.addUseClause('stellar_macros', 'when_not_paused');

    c.addTraitFunction(fungibleTokenTrait, functions.transfer);
    c.addFunctionTag(functions.transfer, 'when_not_paused', fungibleTokenTrait);

    c.addTraitFunction(fungibleTokenTrait, functions.transfer_from);
    c.addFunctionTag(functions.transfer_from, 'when_not_paused', fungibleTokenTrait);
  }

  // `Base` implements every `FungibleToken` method inherently, while the other contract types provide
  // some of them only through the `ContractOverrides` trait, which then has to be in scope. The
  // supply-tracking contract types provide transfers through it as well.
  const tracksSupply = contractTypes.includes('TotalSupply');
  if ((explicitImplementations && contractTypes.length > 0) || (pausable && tracksSupply)) {
    c.addUseClause('stellar_tokens::fungible', 'ContractOverrides');
  }
}

function addTotalSupply(c: ContractBuilder, explicitImplementations: boolean) {
  c.addUseClause('stellar_tokens::fungible', 'total_supply::{FungibleTotalSupply, TotalSupply}');

  const fungibleTotalSupplyTrait = {
    traitName: 'FungibleTotalSupply',
    structName: c.name,
    tags: explicitImplementations ? ['contractimpl'] : ['contractimpl(contracttrait)'],
    section: 'Extensions',
  };

  if (explicitImplementations) c.addTraitFunction(fungibleTotalSupplyTrait, functions.total_supply);
  else c.addTraitImplBlock(fungibleTotalSupplyTrait);
}

function addCap(c: ContractBuilder, cap: string, decimals: bigint, explicitImplementations: boolean): bigint {
  if (!premintPattern.test(cap)) {
    throw new OptionsError({
      cap: 'Not a valid number',
    });
  }

  const capAbsolute = toUint(getInitialSupply(cap, Number(decimals), 'cap'), 'cap', 'u128');
  if (capAbsolute === 0n) {
    throw new OptionsError({
      cap: 'Cap must be greater than 0',
    });
  }

  c.addUseClause('stellar_tokens::fungible', 'capped::{Capped, FungibleCapped}');
  c.addConstructorCode(`Capped::set_cap(e, ${capAbsolute});`);

  const fungibleCappedTrait = {
    traitName: 'FungibleCapped',
    structName: c.name,
    tags: explicitImplementations ? ['contractimpl'] : ['contractimpl(contracttrait)'],
    section: 'Extensions',
  };

  if (explicitImplementations) c.addTraitFunction(fungibleCappedTrait, functions.cap);
  else c.addTraitImplBlock(fungibleCappedTrait);

  return capAbsolute;
}

function addMintable(c: ContractBuilder, access: Access, pausable: boolean, explicitImplementations: boolean) {
  switch (access) {
    case false:
      break;
    case 'ownable': {
      c.addFreeFunction(functions.mint);

      requireAccessControl(c, undefined, functions.mint, access, undefined, explicitImplementations);

      if (pausable) {
        c.addFunctionTag(functions.mint, 'when_not_paused');
      }
      break;
    }
    case 'roles': {
      c.addFreeFunction(functions.mint_with_caller);

      requireAccessControl(
        c,
        undefined,
        functions.mint_with_caller,
        access,
        {
          useMacro: true,
          caller: 'caller',
          role: 'minter',
        },
        explicitImplementations,
      );

      if (pausable) {
        c.addFunctionTag(functions.mint_with_caller, 'when_not_paused');
      }
      break;
    }
    default: {
      const _: never = access;
      throw new Error('Unknown value for `access`');
    }
  }
}

function addBurnable(c: ContractBuilder, pausable: boolean, explicitImplementations: boolean) {
  c.addUseClause('stellar_tokens::fungible', 'burnable::FungibleBurnable');

  const fungibleBurnableTrait = {
    traitName: 'FungibleBurnable',
    structName: c.name,
    tags: explicitImplementations ? ['contractimpl'] : ['contractimpl(contracttrait)'],
    section: 'Extensions',
  };

  if (pausable || explicitImplementations) {
    if (pausable) {
      c.addUseClause('stellar_macros', 'when_not_paused');
    }

    c.addTraitFunction(fungibleBurnableTrait, functions.burn);
    c.addTraitFunction(fungibleBurnableTrait, functions.burn_from);

    if (pausable) {
      c.addFunctionTag(functions.burn, 'when_not_paused', fungibleBurnableTrait);
      c.addFunctionTag(functions.burn_from, 'when_not_paused', fungibleBurnableTrait);
    }
  } else {
    c.addTraitImplBlock(fungibleBurnableTrait);
  }
}

export const premintPattern = /^\d*(?:\.\d*)?$/;

function addPremint(c: ContractBuilder, amount: string, decimals: bigint, capAbsolute?: bigint) {
  if (amount !== undefined && amount !== '0') {
    if (!premintPattern.test(amount)) {
      throw new OptionsError({
        premint: 'Not a valid number',
      });
    }

    // TODO: handle signed int?
    const premintAbsolute = toUint(getInitialSupply(amount, Number(decimals)), 'premint', 'u128');

    if (capAbsolute !== undefined && premintAbsolute > capAbsolute) {
      throw new OptionsError({
        premint: 'Premint exceeds the cap',
        cap: 'Cap is lower than the premint',
      });
    }

    c.addConstructorArgument({ name: 'recipient', type: 'Address' });
    c.addConstructorCode(`<Self as FungibleToken>::ContractType::mint(e, &recipient, ${premintAbsolute});`);
  }
}

/**
 * Calculates the initial supply that would be used in a Fungible contract based on a given premint amount and number of decimals.
 *
 * @param premint Premint amount in token units, may be fractional
 * @param decimals The number of decimals in the token
 * @param field The option reported in errors
 * @returns `premint` with zeros padded or removed based on `decimals`.
 * @throws OptionsError if `premint` has more than one decimal character or is more precise than allowed by the `decimals` argument.
 */
export function getInitialSupply(premint: string, decimals: number, field = 'premint'): string {
  let result;
  const premintSegments = premint.split('.');
  if (premintSegments.length > 2) {
    throw new OptionsError({
      [field]: 'Not a valid number',
    });
  } else {
    const firstSegment = premintSegments[0] ?? '';
    let lastSegment = premintSegments[1] ?? '';
    if (decimals > lastSegment.length) {
      try {
        lastSegment += '0'.repeat(decimals - lastSegment.length);
      } catch {
        // .repeat gives an error if decimals number is too large
        throw new OptionsError({
          [field]: 'Decimals number too large',
        });
      }
    } else if (decimals < lastSegment.length) {
      throw new OptionsError({
        [field]: 'Too many decimals',
      });
    }
    // concat segments without leading zeros
    result = firstSegment.concat(lastSegment).replace(/^0+/, '');
  }
  if (result.length === 0) {
    result = '0';
  }
  return result;
}

export const functions = defineFunctions({
  // Token Functions
  balance: {
    args: [getSelfArg(), { name: 'account', type: 'Address' }],
    returns: 'i128',
    code: ['Self::ContractType::balance(e, &account)'],
  },
  allowance: {
    args: [getSelfArg(), { name: 'owner', type: 'Address' }, { name: 'spender', type: 'Address' }],
    returns: 'i128',
    code: ['Self::ContractType::allowance(e, &owner, &spender)'],
  },
  transfer: {
    args: [
      getSelfArg(),
      { name: 'from', type: 'Address' },
      { name: 'to', type: 'MuxedAddress' },
      { name: 'amount', type: 'i128' },
    ],
    code: ['Self::ContractType::transfer(e, &from, &to, amount)'],
  },
  transfer_from: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'to', type: 'Address' },
      { name: 'amount', type: 'i128' },
    ],
    code: ['Self::ContractType::transfer_from(e, &spender, &from, &to, amount)'],
  },
  approve: {
    args: [
      getSelfArg(),
      { name: 'owner', type: 'Address' },
      { name: 'spender', type: 'Address' },
      { name: 'amount', type: 'i128' },
      { name: 'live_until_ledger', type: 'u32' },
    ],
    code: ['Self::ContractType::approve(e, &owner, &spender, amount, live_until_ledger)'],
  },
  decimals: {
    args: [getSelfArg()],
    returns: 'u32',
    code: ['Self::ContractType::decimals(e)'],
  },
  name: {
    args: [getSelfArg()],
    returns: 'String',
    code: ['Self::ContractType::name(e)'],
  },
  symbol: {
    args: [getSelfArg()],
    returns: 'String',
    code: ['Self::ContractType::symbol(e)'],
  },

  // Extensions
  total_supply: {
    args: [getSelfArg()],
    returns: 'i128',
    code: ['Self::ContractType::total_supply(e)'],
  },
  cap: {
    args: [getSelfArg()],
    returns: 'i128',
    code: ['Capped::cap(e)'],
  },
  burn: {
    args: [getSelfArg(), { name: 'from', type: 'Address' }, { name: 'amount', type: 'i128' }],
    code: ['Self::ContractType::burn(e, &from, amount)'],
  },
  burn_from: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'amount', type: 'i128' },
    ],
    code: ['Self::ContractType::burn_from(e, &spender, &from, amount)'],
  },
  // Minting goes through the contract type, which keeps the total supply, the cap and the voting units up to date.
  mint: {
    args: [getSelfArg(), { name: 'account', type: 'Address' }, { name: 'amount', type: 'i128' }],
    code: ['<Self as FungibleToken>::ContractType::mint(e, &account, amount);'],
  },
  mint_with_caller: {
    name: 'mint',
    args: [
      getSelfArg(),
      { name: 'account', type: 'Address' },
      { name: 'amount', type: 'i128' },
      { name: 'caller', type: 'Address' },
    ],
    code: ['<Self as FungibleToken>::ContractType::mint(e, &account, amount);'],
  },
});

const fungibleTokenTraitFunctions = pickKeys(functions, [
  'balance',
  'allowance',
  'transfer',
  'transfer_from',
  'approve',
  'decimals',
  'name',
  'symbol',
]);
