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
import { pickKeys } from '@openzeppelin/wizard-common';

export const defaults: Required<FungibleOptions> = {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: false,
  votes: false,
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
  votes?: boolean;
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
    votes: opts.votes ?? defaults.votes,
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

  addBase(
    c,
    toByteArray(allOpts.name),
    toByteArray(allOpts.symbol),
    allOpts.votes,
    allOpts.pausable,
    allOpts.explicitImplementations,
  );

  if (allOpts.premint) {
    addPremint(c, allOpts.premint, allOpts.votes);
  }

  if (allOpts.pausable) {
    addPausable(c, allOpts.access, allOpts.explicitImplementations);
  }

  if (allOpts.upgradeable) {
    addUpgradeable(c, allOpts.access, allOpts.explicitImplementations);
  }

  if (allOpts.burnable) {
    addBurnable(c, allOpts.votes, allOpts.pausable, allOpts.explicitImplementations);
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.access, allOpts.votes, allOpts.pausable, allOpts.explicitImplementations);
  }

  setAccessControl(c, allOpts.access, allOpts.explicitImplementations);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(
  c: ContractBuilder,
  name: string,
  symbol: string,
  votes: boolean,
  pausable: boolean,
  explicitImplementations: boolean,
) {
  // Set metadata
  c.addConstructorCode(`Base::set_metadata(e, 7, String::from_str(e, "${name}"), String::from_str(e, "${symbol}"));`);

  // Set token functions
  c.addUseClause('stellar_tokens::fungible', 'Base');
  c.addUseClause('stellar_tokens::fungible', 'FungibleToken');
  if (votes) {
    c.addUseClause('stellar_tokens::fungible', 'ContractOverrides');
    c.addUseClause('stellar_governance::votes', 'Votes');
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
    assocType: `type ContractType = ${votes ? 'FungibleVotes' : 'Base'};`,
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

  if (votes) {
    c.addTraitImplBlock({
      traitName: 'Votes',
      structName: c.name,
      tags: explicitImplementations ? ['contractimpl'] : ['contractimpl(contracttrait)'],
      section: 'Extensions',
    });
  }
}

function addMintable(
  c: ContractBuilder,
  access: Access,
  votes: boolean,
  pausable: boolean,
  explicitImplementations: boolean,
) {
  const mintFn = votes ? votesFunctions.mint : functions.mint;
  const mintWithCallerFn = votes ? votesFunctions.mint_with_caller : functions.mint_with_caller;

  switch (access) {
    case false:
      break;
    case 'ownable': {
      c.addFreeFunction(mintFn);

      requireAccessControl(c, undefined, mintFn, access, undefined, explicitImplementations);

      if (pausable) {
        c.addFunctionTag(mintFn, 'when_not_paused');
      }
      break;
    }
    case 'roles': {
      c.addFreeFunction(mintWithCallerFn);

      requireAccessControl(
        c,
        undefined,
        mintWithCallerFn,
        access,
        {
          useMacro: true,
          caller: 'caller',
          role: 'minter',
        },
        explicitImplementations,
      );

      if (pausable) {
        c.addFunctionTag(mintWithCallerFn, 'when_not_paused');
      }
      break;
    }
    default: {
      const _: never = access;
      throw new Error('Unknown value for `access`');
    }
  }
}

function addBurnable(c: ContractBuilder, votes: boolean, pausable: boolean, explicitImplementations: boolean) {
  c.addUseClause('stellar_tokens::fungible', 'burnable::FungibleBurnable');

  const fungibleBurnableTrait = {
    traitName: 'FungibleBurnable',
    structName: c.name,
    tags: explicitImplementations ? ['contractimpl'] : ['contractimpl(contracttrait)'],
    section: 'Extensions',
  };

  const burnFn = votes ? votesFunctions.burn : functions.burn;
  const burnFromFn = votes ? votesFunctions.burn_from : functions.burn_from;

  if (pausable || votes || explicitImplementations) {
    if (pausable) {
      c.addUseClause('stellar_macros', 'when_not_paused');
    }

    c.addTraitFunction(fungibleBurnableTrait, burnFn);
    c.addTraitFunction(fungibleBurnableTrait, burnFromFn);

    if (pausable) {
      c.addFunctionTag(burnFn, 'when_not_paused', fungibleBurnableTrait);
      c.addFunctionTag(burnFromFn, 'when_not_paused', fungibleBurnableTrait);
    }
  } else {
    c.addTraitImplBlock(fungibleBurnableTrait);
  }
}

export const premintPattern = /^(\d*\.?\d*)$/;

function addPremint(c: ContractBuilder, amount: string, votes: boolean) {
  if (amount !== undefined && amount !== '0') {
    if (!premintPattern.test(amount)) {
      throw new OptionsError({
        premint: 'Not a valid number',
      });
    }

    // TODO: handle signed int?
    const premintAbsolute = toUint(getInitialSupply(amount, 7), 'premint', 'u128');

    c.addConstructorArgument({ name: 'recipient', type: 'Address' });
    c.addConstructorCode(`${votes ? 'FungibleVotes' : 'Base'}::mint(e, &recipient, ${premintAbsolute});`);
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

const votesFunctions = defineFunctions({
  burn: {
    args: [getSelfArg(), { name: 'from', type: 'Address' }, { name: 'amount', type: 'i128' }],
    code: ['FungibleVotes::burn(e, &from, amount)'],
  },
  burn_from: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'amount', type: 'i128' },
    ],
    code: ['FungibleVotes::burn_from(e, &spender, &from, amount)'],
  },
  mint: {
    args: [getSelfArg(), { name: 'account', type: 'Address' }, { name: 'amount', type: 'i128' }],
    code: ['FungibleVotes::mint(e, &account, amount);'],
  },
  mint_with_caller: {
    name: 'mint',
    args: [
      getSelfArg(),
      { name: 'account', type: 'Address' },
      { name: 'amount', type: 'i128' },
      { name: 'caller', type: 'Address' },
    ],
    code: ['FungibleVotes::mint(e, &account, amount);'],
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
