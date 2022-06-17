import { Contract, ContractBuilder } from './contract';
import { Access, setAccessControl } from './set-access-control';
import { addPausable, setPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, withImplicitArgs } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { OptionsError } from './error';
import BN from 'bn.js';
import { defineModules } from './utils/define-modules';
import { defaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { defineNamespaces } from './utils/define-namespaces';

export const defaults: Required<ERC20Options> = {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: false,
  pausable: false,
  premint: '0',
  decimals: '18',
  mintable: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info
} as const;

export function printERC20(opts: ERC20Options = defaults): string {
  return printContract(buildERC20(opts));
}

export interface ERC20Options extends CommonOptions {
  name: string;
  symbol: string;
  burnable?: boolean;
  pausable?: boolean;
  premint?: string;
  mintable?: boolean;
  decimals?: string;
}

function checkDecimals(decimals: string) {
  if (!/^\d+$/.test(decimals)) {
    throw new OptionsError({
      decimals: 'Not a valid number',
    });
  } else if (parseInt(decimals) >= 256) { // 8 bits
    throw new OptionsError({
      decimals: 'Number too large',
    });
  } 
}

function withDefaults(opts: ERC20Options): Required<ERC20Options> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    premint: opts.premint || defaults.premint,
    mintable: opts.mintable ?? defaults.mintable,
    decimals: opts.decimals || defaults.decimals,
  };
}

export function buildERC20(opts: ERC20Options): Contract {
  const c = new ContractBuilder();

  const allOpts = withDefaults(opts);

  checkDecimals(allOpts.decimals);

  addBase(c, allOpts.name, allOpts.symbol, allOpts.decimals);

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

  c.addModule(modules.bool, [], [], false);
  c.addModuleFunction(modules.bool, 'TRUE');

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.pausable) {
    addPausable(c, allOpts.access, [functions.transfer, functions.transferFrom, functions.approve, functions.increaseAllowance, functions.decreaseAllowance]);
    if (allOpts.burnable) {
      setPausable(c, functions.burn);
    }
  }

  if (allOpts.premint) {
    addPremint(c, allOpts.premint, allOpts.decimals);
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.access);
  }

  setUpgradeable(c, allOpts.upgradeable);
  
  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, name: string, symbol: string, decimals: string) {
  c.addModule(
    modules.ERC20,
    [
      name, symbol, { lit: decimals } 
    ],
    [
      functions.transfer, functions.transferFrom, functions.approve, functions.increaseAllowance, functions.decreaseAllowance
    ],
    true,
    namespaces.ERC20
  );
}

function addBurnable(c: ContractBuilder) {
  c.addModule(
    modules.syscalls, [], [], false
  );
  c.addModuleFunction(modules.syscalls, 'get_caller_address');
  c.addFunction(functions.burn);
  c.setFunctionBody(
    [
      'let (owner) = get_caller_address()', 
      'ERC20._burn(owner, amount)'
    ],
    functions.burn
  );
}

export const premintPattern = /^(\d*\.?\d*)$/;

function addPremint(c: ContractBuilder, amount: string, decimals: string) {
  if (amount !== undefined && amount !== '0') {

    if (!premintPattern.test(amount)) {
      throw new OptionsError({
        premint: 'Not a valid number',
      });
    } 

    const premintAbsolute = getPremintAbsolute(amount, parseInt(decimals));
    const premintBN = new BN(premintAbsolute, 10);
    if (premintBN.bitLength() > 256) { // 256 bits
      throw new OptionsError({
        premint: 'Premint argument too large',
        decimals: 'Premint argument too large',
      });
    } else if (premintAbsolute !== '0') {
      const highBits = premintBN.shrn(128);
      const lowBits = premintBN.maskn(128);
  
      c.addConstructorArgument({ name:'recipient', type:'felt' });
      c.addConstructorCode(`ERC20._mint(recipient, Uint256(${lowBits}, ${highBits}))`);
    }
  }
}

/**
 * Gets premint amount, taking the decimals field into consideration.
 * 
 * @param premint Premint amount in token units, may be fractional
 * @param decimals The number of decimals in the token
 * @returns premint with zeros padded or removed
 * @throws OptionsError if premint has more than one decimal character or is more precise than allowed by the decimals field
 */
function getPremintAbsolute(premint: string, decimals: number): string {
  let result;
  const premintSegments = premint.split(".");
  if (premintSegments.length > 2) {
    throw new OptionsError({
      premint: 'Not a valid number',
    });
  } else {
    let firstSegment = premintSegments[0] ?? '';
    let lastSegment = premintSegments[1] ?? '';
    if (decimals > lastSegment.length) {
      try {
        lastSegment += "0".repeat(decimals - lastSegment.length);
      } catch (e) {
        // .repeat gives an error if number is too large, although this should not happen since decimals is limited to 256
        throw new OptionsError({
          decimals: 'Number too large',
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


function addMintable(c: ContractBuilder, access: Access) {
  setAccessControl(c, functions.mint, access);
}

const modules = defineModules( {
  ERC20: {
    path: 'openzeppelin.token.erc20.library.ERC20',
    usePrefix: true
  },

  syscalls: {
    path: 'starkware.starknet.common.syscalls',
    usePrefix: false
  },

  bool: {
    path: 'starkware.cairo.common.bool',
    usePrefix: false
  }
})

const namespaces = defineNamespaces( {
  ERC20: {
    module: modules.ERC20,
  },
})

const functions = defineFunctions({

  // --- view functions ---

  name: {
    module: modules.ERC20,
    namespace: namespaces.ERC20,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
    ],
    returns: [{ name: 'name', type: 'felt' }],
    passthrough: true,
  },

  symbol: {
    module: modules.ERC20,
    namespace: namespaces.ERC20,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
    ],
    returns: [{ name: 'symbol', type: 'felt' }],
    passthrough: true,
  },

  totalSupply: {
    module: modules.ERC20,
    namespace: namespaces.ERC20,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
    ],
    returns: [{ name: 'totalSupply', type: 'Uint256' }],
    passthrough: true,
    parentFunctionName: 'total_supply',
  },

  decimals: {
    module: modules.ERC20,
    namespace: namespaces.ERC20,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
    ],
    returns: [{ name: 'decimals', type: 'felt' }],
    passthrough: true,
  },

  balanceOf: {
    module: modules.ERC20,
    namespace: namespaces.ERC20,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'account', type: 'felt' },
    ],
    returns: [{ name: 'balance', type: 'Uint256' }],
    passthrough: true,
    parentFunctionName: 'balance_of',
  },

  allowance: {
    module: modules.ERC20,
    namespace: namespaces.ERC20,
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
    module: modules.ERC20,
    namespace: namespaces.ERC20,
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
    module: modules.ERC20,
    namespace: namespaces.ERC20,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'sender', type: 'felt' },
      { name: 'recipient', type: 'felt' },
      { name: 'amount', type: 'Uint256' },
    ],
    returns: [{ name: 'success', type: 'felt' }],
    returnValue: 'TRUE',
    parentFunctionName: 'transfer_from',
  },

  approve: {
    module: modules.ERC20,
    namespace: namespaces.ERC20,
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
    module: modules.ERC20,
    namespace: namespaces.ERC20,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'spender', type: 'felt' },
      { name: 'added_value', type: 'Uint256' },
    ],
    returns: [{ name: 'success', type: 'felt' }],
    returnValue: 'TRUE',
    parentFunctionName: 'increase_allowance',
  },

  decreaseAllowance: {
    module: modules.ERC20,
    namespace: namespaces.ERC20,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'spender', type: 'felt' },
      { name: 'subtracted_value', type: 'Uint256' },
    ],
    returns: [{ name: 'success', type: 'felt' }],
    returnValue: 'TRUE',
    parentFunctionName: 'decrease_allowance',
  },

  mint: {
    module: modules.ERC20,
    namespace: namespaces.ERC20,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'to', type: 'felt' },
      { name: 'amount', type: 'Uint256' },
    ],
    parentFunctionName: '_mint'
  },

  burn: {
    module: modules.ERC20,
    namespace: namespaces.ERC20,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'amount', type: 'Uint256' },
    ],
    parentFunctionName: '_burn'
  },

});
