import { Contract, ContractBuilder } from './contract';
import { Access, setAccessControl } from './set-access-control';
import { addPausable, setPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, withImplicitArgs } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { OptionsError } from './error';

export interface ERC20Options extends CommonOptions {
  name: string;
  symbol: string;
  burnable?: boolean;
  snapshots?: boolean;
  pausable?: boolean;
  premint?: string;
  mintable?: boolean;
  permit?: boolean;
  votes?: boolean;
  flashmint?: boolean;
  decimals?: string;
}

function checkDecimals(decimals: string) {
  if (!/^\d+$/.test(decimals)) {
    throw new OptionsError({
      decimals: 'Not a valid number',
    });
  } 
}

export function buildERC20(opts: ERC20Options): Contract {
  const c = new ContractBuilder(opts.name);

  const { access, upgradeable, info } = withCommonDefaults(opts);

  // TODO add imports for starkware common libraries without initializer

  if (opts.decimals !== undefined) {
    checkDecimals(opts.decimals);
  }

  addBase(c, opts.name, opts.symbol, opts.decimals ?? '18'); // TODO define this default somewhere

  c.addFunction(functions.name);
  c.addFunction(functions.symbol);
  c.addFunction(functions.totalSupply);
  c.addFunction(functions.decimals);
  c.addFunction(functions.balanceOf);
  c.addFunction(functions.allowance);

  c.addFunction(functions.transfer);
  c.addFunction(functions.transferFrom);
  c.addFunction(functions.approve);
  c.addFunction(functions.increaseAllowance);
  c.addFunction(functions.decreaseAllowance);

  c.addParentLibrary(
    {
      prefix: 'constants', // TODO add an import (rather than a parent library) to a map without relying on prefix, since prefix does not make sense in context of some libs such as utils
      modulePath: 'openzeppelin.utils.constants',
    },
    [],
    ['TRUE'],
    false
  );

  // c.addFunctionCode(`# Cairo equivalent to 'return (true)'`, functions.transfer);
  // c.addFunctionCode(`# Cairo equivalent to 'return (true)'`, functions.transferFrom);
  // c.addFunctionCode(`# Cairo equivalent to 'return (true)'`, functions.approve);
  // c.addFunctionCode(`# Cairo equivalent to 'return (true)'`, functions.increaseAllowance);
  // c.addFunctionCode(`# Cairo equivalent to 'return (true)'`, functions.decreaseAllowance);

  if (opts.burnable) {
    addBurnable(c);
  }

  // if (opts.snapshots) {
  //   addSnapshot(c, access);
  // }

  if (opts.pausable) {
    addPausable(c, access, [functions.transfer, functions.transferFrom, functions.approve, functions.increaseAllowance, functions.decreaseAllowance]);
    if (opts.burnable) {
      setPausable(c, functions.burn);
    }
  }

  if (opts.premint) {
    addPremint(c, opts.premint, opts.decimals ?? '18'); // TODO define this default somewhere
  }

  if (opts.mintable) {
    addMintable(c, access);
  }

  // // Note: Votes requires Permit
  // if (opts.permit || opts.votes) {
  //   addPermit(c, opts.name);
  // }

  // if (opts.votes) {
  //   addVotes(c);
  // }

  // if (opts.flashmint) {
  //   addFlashMint(c);
  // }

  setUpgradeable(c, upgradeable); //, access);
  
  setInfo(c, info);

  return c;
}

function addBase(c: ContractBuilder, name: string, symbol: string, decimals: string) {
  c.addParentLibrary(
    {
      prefix: 'ERC20',
      modulePath: 'openzeppelin/token/erc20/library',
    },
    [name, symbol, decimals],
    ['ERC20_transfer', 'ERC20_transferFrom', 'ERC20_approve', 'ERC20_increaseAllowance', 'ERC20_decreaseAllowance', 'ERC20_initializer'],
    // TODO use initializable boolean to determine if parent initializer is imported
  );
}

function addBurnable(c: ContractBuilder) {
  c.addParentLibrary(
    {
      prefix: 'syscalls', // TODO add an import (rather than a parent library) to a map without relying on prefix, since prefix does not make sense in context of some libs such as utils
      modulePath: 'starkware.starknet.common.syscalls',
    },
    [],
    ['get_caller_address'],
    false
  ); 
  c.addFunction(functions.burn);
  c.setFunctionBody(
    ['let (owner) = get_caller_address()', 'ERC20_burn(owner, amount)'],
     functions.burn
  );
}

// function addSnapshot(c: ContractBuilder, access: Access) {
//   c.addParent({
//     name: 'ERC20Snapshot',
//     path: 'contracts/token/ERC20/extensions/ERC20Snapshot',
//   });

//   c.addOverride('ERC20Snapshot', functions._beforeTokenTransfer);

//   setAccessControl(c, functions.snapshot, access, 'SNAPSHOT');
//   c.addFunctionCode('_snapshot();', functions.snapshot);
// }

export const premintPattern = /^(\d*)(?:\.(\d+))?(?:e(\d+))?$/; // TODO don't allow exponent?

function addPremint(c: ContractBuilder, amount: string, decimals: string) {
  // const m = amount.match(premintPattern);
  // if (m) {
  //   const integer = m[1]?.replace(/^0+/, '') ?? '';
  //   const decimals = m[2]?.replace(/0+$/, '') ?? '';
  //   const exponent = Number(m[3] ?? 0);

  //   if (Number(integer + decimals) > 0) {
  //     const decimalPlace = decimals.length - exponent;
  //     const zeroes = new Array(Math.max(0, -decimalPlace)).fill('0').join('');
  //     const units = integer + decimals + zeroes;
  //     const exp = decimalPlace <= 0 ? 'decimals()' : `(decimals() - ${decimalPlace})`;
  //     c.addConstructorArgument({ name:'recipient', type:'felt' });
  //     c.addConstructorCode(`ERC20_mint(recipient, Uint256(${units} * 10 ** ${exp}, 0)`);
  //   }
  // }

  if (amount !== undefined && amount !== '0') {

    if (!/^\d+$/.test(amount)) {
      throw new OptionsError({
        premint: 'Not a valid number',
      });
    } 
    // TODO allow amount to be fractional, make use of premintPattern?

    c.addConstructorArgument({ name:'recipient', type:'felt' });
    c.addConstructorCode(`ERC20_mint(recipient, Uint256(${amount + "0".repeat(parseInt(decimals))}, 0))`); // TODO represent exponent in Cairo and/or handle floating point errors
  }

  c.addParentFunctionImport(
    'ERC20',
    `ERC20_mint`
  );
  // c.addConstructorArgument({ name:'decimals', type:'felt' });
  // c.addConstructorArgument({ name:'initial_supply', type:'Uint256' });
  // c.addConstructorArgument({ name:'recipient', type:'felt' });
  // c.addConstructorCode('ERC20_mint(recipient, initial_supply)');
}

function addMintable(c: ContractBuilder, access: Access) {
  setAccessControl(c, functions.mint, access, 'MINTER');
  //c.addFunctionCode('_mint(to, amount);', functions.mint);
}

// function addPermit(c: ContractBuilder, name: string) {
//   c.addParent({
//     name: 'ERC20Permit',
//     path: 'contracts/token/ERC20/extensions/draft-ERC20Permit',
//   }, [name]);
// }

// function addVotes(c: ContractBuilder) {
//   if (!c.parents.some(p => p.contract.name === 'ERC20Permit')) {
//     throw new Error('Missing ERC20Permit requirement for ERC20Votes');
//   }

//   c.addParent({
//     name: 'ERC20Votes',
//     path: 'contracts/token/ERC20/extensions/ERC20Votes',
//   });
// }

// function addFlashMint(c: ContractBuilder) {
//   c.addParent({
//     name: 'ERC20FlashMint',
//     path: 'contracts/token/ERC20/extensions/ERC20FlashMint',
//   });
// }

const functions = defineFunctions({

  // --- view functions ---

  name: {
    module: 'ERC20',
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
    ],
    returns: [{ name: 'name', type: 'felt' }],
    passthrough: true,
  },

  symbol: {
    module: 'ERC20',
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
    ],
    returns: [{ name: 'symbol', type: 'felt' }],
    passthrough: true,
  },

  totalSupply: {
    module: 'ERC20',
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
    ],
    returns: [{ name: 'totalSupply', type: 'Uint256' }],
    passthrough: true,
  },

  decimals: {
    module: 'ERC20',
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
    ],
    returns: [{ name: 'decimals', type: 'felt' }],
    passthrough: true,
  },

  balanceOf: {
    module: 'ERC20',
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'account', type: 'felt' },
    ],
    returns: [{ name: 'balance', type: 'Uint256' }],
    passthrough: true,
  },

  allowance: {
    module: 'ERC20',
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'owner', type: 'felt' },
      { name: 'spender', type: 'felt' },
    ],
    returns: [{ name: 'remaining', type: 'Uint256' }],
    passthrough: true,
  },

  // --- external functions ---

  transfer: {
    module: 'ERC20',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'recipient', type: 'felt' },
      { name: 'amount', type: 'Uint256' },
    ],
    returns: [{ name: 'success', type: 'felt' }],
    returnValue: 'TRUE',
  },

  transferFrom: {
    module: 'ERC20',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'sender', type: 'felt' },
      { name: 'recipient', type: 'felt' },
      { name: 'amount', type: 'Uint256' },
    ],
    returns: [{ name: 'success', type: 'felt' }],
    returnValue: 'TRUE',
  },

  approve: {
    module: 'ERC20',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'spender', type: 'felt' },
      { name: 'amount', type: 'Uint256' },
    ],
    returns: [{ name: 'success', type: 'felt' }],
    returnValue: 'TRUE',
  },

  increaseAllowance: {
    module: 'ERC20',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'spender', type: 'felt' },
      { name: 'added_value', type: 'Uint256' },
    ],
    returns: [{ name: 'success', type: 'felt' }],
    returnValue: 'TRUE',
  },

  decreaseAllowance: {
    module: 'ERC20',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'spender', type: 'felt' },
      { name: 'subtracted_value', type: 'Uint256' },
    ],
    returns: [{ name: 'success', type: 'felt' }],
    returnValue: 'TRUE',
  },

  mint: {
    module: 'ERC20',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'to', type: 'felt' },
      { name: 'amount', type: 'Uint256' },
    ],
  },

  burn: {
    module: 'ERC20',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      // { name: 'account', type: 'felt' },
      { name: 'amount', type: 'Uint256' },
    ],
  },


  // pause: {
  //   kind: 'external' as const,
  //   args: [],
  // },

  // unpause: {
  //   kind: 'external' as const,
  //   args: [],
  // },

  // snapshot: {
  //   kind: 'external' as const,
  //   args: [],
  // },
});
