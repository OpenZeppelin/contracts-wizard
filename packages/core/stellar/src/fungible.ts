import { ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { requireAccessControl, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { addUpgradeable } from './add-upgradeable';
import { defineFunctions } from './utils/define-functions';
import type { CommonContractOptions } from './common-options';
import { withCommonContractDefaults, getSelfArg } from './common-options';
import { setInfo } from './set-info';
import { OptionsError } from './error';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { toByteArray, toUint } from './utils/convert-strings';
import { pickKeys } from '@openzeppelin/wizard-common/src/utils/object';

export const defaults: Required<FungibleOptions> = {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: false,
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
  burnable?: boolean;
  pausable?: boolean;
  upgradeable?: boolean;
  premint?: string;
  mintable?: boolean;
}

export function withDefaults(opts: FungibleOptions): Required<FungibleOptions> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
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
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c, toByteArray(allOpts.name), toByteArray(allOpts.symbol), allOpts.pausable, allOpts.explicitImplementations);

  if (allOpts.premint) {
    addPremint(c, allOpts.premint);
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
  pausable: boolean,
  explicitImplementations: boolean,
) {
  // Set metadata
  c.addConstructorCode(`Base::set_metadata(e, 18, String::from_str(e, "${name}"), String::from_str(e, "${symbol}"));`);

  // Set token functions
  c.addUseClause('stellar_tokens::fungible', 'Base');
  c.addUseClause('stellar_tokens::fungible', 'FungibleToken');
  if (!explicitImplementations) c.addUseClause('stellar_macros', 'default_impl');
  c.addUseClause('soroban_sdk', 'contract');
  c.addUseClause('soroban_sdk', 'contractimpl');
  c.addUseClause('soroban_sdk', 'String');
  c.addUseClause('soroban_sdk', 'Env');
  if (explicitImplementations || pausable) {
    c.addUseClause('soroban_sdk', 'Address');
  }

  const fungibleTokenTrait = {
    traitName: 'FungibleToken',
    structName: c.name,
    tags: explicitImplementations ? ['contractimpl'] : ['default_impl', 'contractimpl'],
    assocType: 'type ContractType = Base;',
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
}

function addMintable(c: ContractBuilder, access: Access, pausable: boolean, explicitImplementations: boolean) {
  c.addUseClause('soroban_sdk', 'Address');
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
  c.addUseClause('soroban_sdk', 'Address');

  const fungibleBurnableTrait = {
    traitName: 'FungibleBurnable',
    structName: c.name,
    tags: ['contractimpl'],
    section: 'Extensions',
  };

  if (pausable) {
    c.addUseClause('stellar_macros', 'when_not_paused');

    c.addTraitFunction(fungibleBurnableTrait, functions.burn);
    c.addFunctionTag(functions.burn, 'when_not_paused', fungibleBurnableTrait);

    c.addTraitFunction(fungibleBurnableTrait, functions.burn_from);
    c.addFunctionTag(functions.burn_from, 'when_not_paused', fungibleBurnableTrait);
  } else if (explicitImplementations) c.addTraitForEachFunctions(fungibleBurnableTrait, fungibleBurnableFunctions);
  else {
    // prepend '#[default_impl]'
    fungibleBurnableTrait.tags.unshift('default_impl');
    c.addTraitImplBlock(fungibleBurnableTrait);
  }
}

export const premintPattern = /^(\d*\.?\d*)$/;

function addPremint(c: ContractBuilder, amount: string) {
  if (amount !== undefined && amount !== '0') {
    if (!premintPattern.test(amount)) {
      throw new OptionsError({
        premint: 'Not a valid number',
      });
    }

    // TODO: handle signed int?
    const premintAbsolute = toUint(getInitialSupply(amount, 18), 'premint', 'u128');

    c.addUseClause('soroban_sdk', 'Address');

    c.addConstructorArgument({ name: 'recipient', type: 'Address' });
    c.addConstructorCode(`Base::mint(e, &recipient, ${premintAbsolute});`);
  }
}

/**
 * Calculates the initial supply that would be used in a Fungible contract based on a given premint amount and number of decimals.
 *
 * @param premint Premint amount in token units, may be fractional
 * @param decimals The number of decimals in the token
 * @returns `premint` with zeros padded or removed based on `decimals`.
 * @throws OptionsError if `premint` has more than one decimal character or is more precise than allowed by the `decimals` argument.
 */
export function getInitialSupply(premint: string, decimals: number): string {
  let result;
  const premintSegments = premint.split('.');
  if (premintSegments.length > 2) {
    throw new OptionsError({
      premint: 'Not a valid number',
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
          premint: 'Decimals number too large',
        });
      }
    } else if (decimals < lastSegment.length) {
      throw new OptionsError({
        premint: 'Too many decimals',
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
  total_supply: {
    args: [getSelfArg()],
    returns: 'i128',
    code: ['Self::ContractType::total_supply(e)'],
  },
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
      { name: 'to', type: 'Address' },
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
  burn: {
    args: [getSelfArg(), { name: 'from', type: 'Address' }, { name: 'amount', type: 'i128' }],
    code: ['Base::burn(e, &from, amount)'],
  },
  burn_from: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'amount', type: 'i128' },
    ],
    code: ['Base::burn_from(e, &spender, &from, amount)'],
  },
  mint: {
    args: [getSelfArg(), { name: 'account', type: 'Address' }, { name: 'amount', type: 'i128' }],
    code: ['Base::mint(e, &account, amount);'],
  },
  mint_with_caller: {
    name: 'mint',
    args: [
      getSelfArg(),
      { name: 'account', type: 'Address' },
      { name: 'amount', type: 'i128' },
      { name: 'caller', type: 'Address' },
    ],
    code: ['Base::mint(e, &account, amount);'],
  },
});

const fungibleTokenTraitFunctions = pickKeys(functions, [
  'total_supply',
  'balance',
  'allowance',
  'transfer',
  'transfer_from',
  'approve',
  'decimals',
  'name',
  'symbol',
]);

const fungibleBurnableFunctions = pickKeys(functions, ['burn', 'burn_from']);
