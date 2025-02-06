import { Contract, ContractBuilder } from './contract';
import { Access, setAccessControl, requireAccessControl } from './set-access-control';
import { addPauseFunctions } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, defaults as commonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { printContract } from './print';
import { ClockMode, clockModeDefault, setClockMode } from './set-clock-mode';
import { supportsInterface } from './common-functions';
import { OptionsError } from './error';

export interface ERC20Options extends CommonOptions {
  name: string;
  symbol: string;
  burnable?: boolean;
  pausable?: boolean;
  premint?: string;
  mintable?: boolean;
  permit?: boolean;
  /**
   * Whether to keep track of historical balances for voting in on-chain governance, and optionally specify the clock mode.
   * Setting `true` is equivalent to 'blocknumber'. Setting a clock mode implies voting is enabled.
   */
  votes?: boolean | ClockMode;
  flashmint?: boolean;
  bridgeable?: boolean | 'superchain';
}

export const defaults: Required<ERC20Options> = {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: false,
  pausable: false,
  premint: '0',
  mintable: false,
  permit: true,
  votes: false,
  flashmint: false,
  bridgeable: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
} as const;

export function withDefaults(opts: ERC20Options): Required<ERC20Options> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    premint: opts.premint || defaults.premint,
    mintable: opts.mintable ?? defaults.mintable,
    permit: opts.permit ?? defaults.permit,
    votes: opts.votes ?? defaults.votes,
    flashmint: opts.flashmint ?? defaults.flashmint,
    bridgeable: opts.bridgeable ?? defaults.bridgeable,
  };
}

export function printERC20(opts: ERC20Options = defaults): string {
  return printContract(buildERC20(opts));
}

export function isAccessControlRequired(opts: Partial<ERC20Options>): boolean {
  return opts.mintable || opts.pausable || opts.upgradeable === 'uups';
}

export function buildERC20(opts: ERC20Options): ContractBuilder {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  const { access, upgradeable, info } = allOpts;

  addBase(c, allOpts.name, allOpts.symbol);

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.pausable) {
    addPausableExtension(c, access);
  }

  if (allOpts.premint) {
    addPremint(c, allOpts.premint);
  }

  if (allOpts.mintable) {
    addMintable(c, access);
  }

  // Note: Votes requires Permit
  if (allOpts.permit || allOpts.votes) {
    addPermit(c, allOpts.name);
  }

  if (allOpts.votes) {
    const clockMode = allOpts.votes === true ? clockModeDefault : allOpts.votes;
    addVotes(c, clockMode);
  }

  if (allOpts.flashmint) {
    addFlashMint(c);
  }

  if (allOpts.bridgeable) {
    addBridgeable(c, allOpts.bridgeable, allOpts.upgradeable, access);
  }

  setAccessControl(c, access);
  setUpgradeable(c, upgradeable, access);
  setInfo(c, info);

  return c;
}

function addBase(c: ContractBuilder, name: string, symbol: string) {
  const ERC20 = {
    name: 'ERC20',
    path: '@openzeppelin/contracts/token/ERC20/ERC20.sol',
  };
  c.addParent(
    ERC20,
    [name, symbol],
  );

  c.addOverride(ERC20, functions._update);
  c.addOverride(ERC20, functions._approve); // allows override from stablecoin
}

function addPausableExtension(c: ContractBuilder, access: Access) {
  const ERC20Pausable = {
    name: 'ERC20Pausable',
    path: '@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol',
  };
  c.addParent(ERC20Pausable);
  c.addOverride(ERC20Pausable, functions._update);

  addPauseFunctions(c, access);
}

function addBurnable(c: ContractBuilder) {
  c.addParent({
    name: 'ERC20Burnable',
    path: '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol',
  });
}

export const premintPattern = /^(\d*)(?:\.(\d+))?(?:e(\d+))?$/;

function addPremint(c: ContractBuilder, amount: string) {
  const m = amount.match(premintPattern);
  if (m) {
    const integer = m[1]?.replace(/^0+/, '') ?? '';
    const decimals = m[2]?.replace(/0+$/, '') ?? '';
    const exponent = Number(m[3] ?? 0);

    if (Number(integer + decimals) > 0) {
      const decimalPlace = decimals.length - exponent;
      const zeroes = new Array(Math.max(0, -decimalPlace)).fill('0').join('');
      const units = integer + decimals + zeroes;
      const exp = decimalPlace <= 0 ? 'decimals()' : `(decimals() - ${decimalPlace})`;
      c.addConstructorArgument({type: 'address', name: 'recipient'});
      c.addConstructorCode(`_mint(recipient, ${units} * 10 ** ${exp});`);
    }
  }
}

function addMintable(c: ContractBuilder, access: Access) {
  requireAccessControl(c, functions.mint, access, 'MINTER', 'minter');
  c.addFunctionCode('_mint(to, amount);', functions.mint);
}

function addPermit(c: ContractBuilder, name: string) {
  const ERC20Permit = {
    name: 'ERC20Permit',
    path: '@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol',
  };
  c.addParent(ERC20Permit, [name]);
  c.addOverride(ERC20Permit, functions.nonces);

}

function addVotes(c: ContractBuilder, clockMode: ClockMode) {
  if (!c.parents.some(p => p.contract.name === 'ERC20Permit')) {
    throw new Error('Missing ERC20Permit requirement for ERC20Votes');
  }

  const ERC20Votes = {
    name: 'ERC20Votes',
    path: '@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol',
  };
  c.addParent(ERC20Votes);
  c.addOverride(ERC20Votes, functions._update);

  c.addImportOnly({
    name: 'Nonces',
    path: '@openzeppelin/contracts/utils/Nonces.sol',
  });
  c.addOverride({
    name: 'Nonces',
  }, functions.nonces);

  setClockMode(c, ERC20Votes, clockMode);
}

function addFlashMint(c: ContractBuilder) {
  c.addParent({
    name: 'ERC20FlashMint',
    path: '@openzeppelin/contracts/token/ERC20/extensions/ERC20FlashMint.sol',
  });
}

function addBridgeable(c: ContractBuilder, bridgeable: true | 'superchain', upgradeable: false | 'transparent' | 'uups', access: Access) {

  const ERC20Bridgeable = {
    name: 'ERC20Bridgeable',
    path: `@openzeppelin/community-contracts/contracts/token/ERC20/extensions/ERC20Bridgeable.sol`,
  };

  c.addParent(ERC20Bridgeable);
  c.addOverride(ERC20Bridgeable, supportsInterface);

  if (upgradeable) {
    throw new OptionsError({
      bridgeable: 'Bridgeable does not currently support use in upgradeable contracts'
    });
  }

  c.addOverride(ERC20Bridgeable, functions._checkTokenBridge);
  if (bridgeable === 'superchain') {
    c.addVariable('address internal constant SUPERCHAIN_TOKEN_BRIDGE = 0x4200000000000000000000000000000000000028;');
    c.setFunctionBody(['if (caller != SUPERCHAIN_TOKEN_BRIDGE) revert Unauthorized();'], functions._checkTokenBridge, 'pure');
  } else {
    switch (access) {
      case false:
      case 'ownable': {
        const addedImmutable = c.addVariable(`address public immutable TOKEN_BRIDGE;`);
        if (addedImmutable) {
          c.addConstructorArgument({type: 'address', name: 'tokenBridge'});
          c.addConstructorCode(`require(tokenBridge != address(0), "Invalid TOKEN_BRIDGE address");`);
          c.addConstructorCode(`TOKEN_BRIDGE = tokenBridge;`);
        }
        c.setFunctionBody([`if (caller != TOKEN_BRIDGE) revert Unauthorized();`], functions._checkTokenBridge, 'view');
        break;
      }
      case 'roles': {
        setAccessControl(c, access);
        const roleOwner = 'tokenBridge';
        const roleId = 'TOKEN_BRIDGE_ROLE';
        const addedConstant = c.addVariable(`bytes32 public constant ${roleId} = keccak256("${roleId}");`);
        if (addedConstant) {
          c.addConstructorArgument({type: 'address', name: roleOwner});
          c.addConstructorCode(`_grantRole(${roleId}, ${roleOwner});`);
        }
        c.setFunctionBody([`if (!hasRole(${roleId}, caller)) revert Unauthorized();`], functions._checkTokenBridge, 'view');
        break;
      }
      case 'managed': {
        setAccessControl(c, access);
        c.addImportOnly({
          name: 'AuthorityUtils',
          path: `@openzeppelin/contracts/access/manager/AuthorityUtils.sol`,
        });
        const logic = [
          `(bool immediate,) = AuthorityUtils.canCallWithDelay(authority(), caller, address(this), bytes4(_msgData()[0:4]));`,
          `if (!immediate) revert Unauthorized();`
        ]
        c.setFunctionBody(logic, functions._checkTokenBridge, 'view');
        break;
      }
    }
  }
  c.addVariable('error Unauthorized();');
}

export const functions = defineFunctions({
  _update: {
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
  },

  _approve: {
    kind: 'internal' as const,
    args: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'emitEvent', type: 'bool' },
    ],
  },

  mint: {
    kind: 'public' as const,
    args: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },

  pause: {
    kind: 'public' as const,
    args: [],
  },

  unpause: {
    kind: 'public' as const,
    args: [],
  },

  snapshot: {
    kind: 'public' as const,
    args: [],
  },

  nonces: {
    kind: 'public' as const,
    args: [
      { name: 'owner', type: 'address' },
    ],
    returns: ['uint256'],
    mutability: 'view' as const,
  },

  _checkTokenBridge: {
    kind: 'internal' as const,
    args: [
      { name: 'caller', type: 'address' },
    ],
  }
});
