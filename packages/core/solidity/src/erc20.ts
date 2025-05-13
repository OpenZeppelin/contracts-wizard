import { ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { setAccessControl, requireAccessControl } from './set-access-control';
import { addPauseFunctions } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import type { CommonOptions } from './common-options';
import { withCommonDefaults, defaults as commonDefaults } from './common-options';
import type { Upgradeable } from './set-upgradeable';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { printContract } from './print';
import type { ClockMode } from './set-clock-mode';
import { clockModeDefault, setClockMode } from './set-clock-mode';
import { supportsInterface } from './common-functions';
import { OptionsError } from './error';
import { toUint256, UINT256_MAX } from './utils/convert-strings';

export const crossChainBridgingOptions = [false, 'custom', 'superchain'] as const;
export type CrossChainBridging = (typeof crossChainBridgingOptions)[number];

export interface ERC20Options extends CommonOptions {
  name: string;
  symbol: string;
  burnable?: boolean;
  pausable?: boolean;
  premint?: string;
  premintChainId?: string;
  mintable?: boolean;
  callback?: boolean;
  permit?: boolean;
  /**
   * Whether to keep track of historical balances for voting in on-chain governance, and optionally specify the clock mode.
   * Setting `true` is equivalent to 'blocknumber'. Setting a clock mode implies voting is enabled.
   */
  votes?: boolean | ClockMode;
  flashmint?: boolean;
  crossChainBridging?: CrossChainBridging;
}

export const defaults: Required<ERC20Options> = {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: false,
  pausable: false,
  premint: '0',
  premintChainId: '',
  mintable: false,
  callback: false,
  permit: true,
  votes: false,
  flashmint: false,
  crossChainBridging: false,
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
    premintChainId: opts.premintChainId || defaults.premintChainId,
    mintable: opts.mintable ?? defaults.mintable,
    callback: opts.callback ?? defaults.callback,
    permit: opts.permit ?? defaults.permit,
    votes: opts.votes ?? defaults.votes,
    flashmint: opts.flashmint ?? defaults.flashmint,
    crossChainBridging: opts.crossChainBridging ?? defaults.crossChainBridging,
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

  if (allOpts.crossChainBridging) {
    addCrossChainBridging(c, allOpts.crossChainBridging, allOpts.upgradeable, access);
  }

  if (allOpts.premint) {
    addPremint(c, allOpts.premint, allOpts.premintChainId, allOpts.crossChainBridging);
  }

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.pausable) {
    addPausableExtension(c, access);
  }

  if (allOpts.mintable) {
    addMintable(c, access);
  }

  if (allOpts.callback) {
    addCallback(c);
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
  c.addParent(ERC20, [name, symbol]);

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

export const chainIdPattern = /^(?!$)[1-9]\d*$/;

export function isValidChainId(str: string): boolean {
  return chainIdPattern.test(str);
}

function scaleByPowerOfTen(base: bigint, exponent: number): bigint {
  if (exponent < 0) {
    return base / BigInt(10) ** BigInt(-exponent);
  } else {
    return base * BigInt(10) ** BigInt(exponent);
  }
}

function addPremint(
  c: ContractBuilder,
  amount: string,
  premintChainId: string,
  crossChainBridging: CrossChainBridging,
) {
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

      const validatedBaseUnits = toUint256(units, 'premint');
      checkPotentialPremintOverflow(validatedBaseUnits, decimalPlace);

      c.addConstructorArgument({ type: 'address', name: 'recipient' });

      const mintLine = `_mint(recipient, ${units} * 10 ** ${exp});`;

      if (crossChainBridging) {
        if (premintChainId === '') {
          throw new OptionsError({
            premintChainId: 'Chain ID is required when using Premint with Cross-Chain Bridging',
          });
        }

        if (!isValidChainId(premintChainId)) {
          throw new OptionsError({
            premintChainId: 'Not a valid chain ID',
          });
        }

        c.addConstructorCode(`if (block.chainid == ${premintChainId}) {`);
        c.addConstructorCode(`    ${mintLine}`);
        c.addConstructorCode(`}`);
      } else {
        c.addConstructorCode(mintLine);
      }
    }
  } else {
    throw new OptionsError({
      premint: 'Not a valid number',
    });
  }
}

/**
 * Check for potential premint overflow assuming the user's contract has decimals() = 18
 *
 * @param baseUnits The base units of the token, before applying power of 10
 * @param decimalPlace If positive, the number of assumed decimal places in the least significant digits of `validatedBaseUnits`. Ignored if <= 0.
 * @throws OptionsError if the calculated value would overflow uint256
 */
function checkPotentialPremintOverflow(baseUnits: bigint, decimalPlace: number) {
  const assumedExp = decimalPlace <= 0 ? 18 : 18 - decimalPlace;
  const calculatedValue = scaleByPowerOfTen(baseUnits, assumedExp);

  if (calculatedValue > UINT256_MAX) {
    throw new OptionsError({
      premint: 'Amount would overflow uint256 after applying decimals',
    });
  }
}

function addMintable(c: ContractBuilder, access: Access) {
  requireAccessControl(c, functions.mint, access, 'MINTER', 'minter');
  c.addFunctionCode('_mint(to, amount);', functions.mint);
}

function addCallback(c: ContractBuilder) {
  const ERC1363 = {
    name: 'ERC1363',
    path: '@openzeppelin/contracts/token/ERC20/extensions/ERC1363.sol',
  };
  c.addParent(ERC1363);
  c.addOverride(ERC1363, supportsInterface);
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
  c.addOverride(
    {
      name: 'Nonces',
    },
    functions.nonces,
  );

  setClockMode(c, ERC20Votes, clockMode);
}

function addFlashMint(c: ContractBuilder) {
  c.addParent({
    name: 'ERC20FlashMint',
    path: '@openzeppelin/contracts/token/ERC20/extensions/ERC20FlashMint.sol',
  });
}

function addCrossChainBridging(
  c: ContractBuilder,
  crossChainBridging: 'custom' | 'superchain',
  upgradeable: Upgradeable,
  access: Access,
) {
  const ERC20Bridgeable = {
    name: 'ERC20Bridgeable',
    path: `@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Bridgeable.sol`,
  };

  c.addParent(ERC20Bridgeable);
  c.addOverride(ERC20Bridgeable, supportsInterface);

  if (upgradeable) {
    throw new OptionsError({
      crossChainBridging: 'Upgradeability is not currently supported with Cross-Chain Bridging',
    });
  }

  c.addOverride(ERC20Bridgeable, functions._checkTokenBridge);
  switch (crossChainBridging) {
    case 'custom':
      addCustomBridging(c, access);
      break;
    case 'superchain':
      addSuperchainERC20(c);
      break;
    default: {
      const _: never = crossChainBridging;
      throw new Error('Unknown value for `crossChainBridging`');
    }
  }
  c.addVariable('error Unauthorized();');
}

function addCustomBridging(c: ContractBuilder, access: Access) {
  switch (access) {
    case false:
    case 'ownable': {
      const addedBridgeImmutable = c.addVariable(`address public immutable TOKEN_BRIDGE;`);
      if (addedBridgeImmutable) {
        c.addConstructorArgument({ type: 'address', name: 'tokenBridge' });
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
      const addedRoleConstant = c.addVariable(`bytes32 public constant ${roleId} = keccak256("${roleId}");`);
      if (addedRoleConstant) {
        c.addConstructorArgument({ type: 'address', name: roleOwner });
        c.addConstructorCode(`_grantRole(${roleId}, ${roleOwner});`);
      }
      c.setFunctionBody(
        [`if (!hasRole(${roleId}, caller)) revert Unauthorized();`],
        functions._checkTokenBridge,
        'view',
      );
      break;
    }
    case 'managed': {
      setAccessControl(c, access);
      c.addImportOnly({
        name: 'AuthorityUtils',
        path: `@openzeppelin/contracts/access/manager/AuthorityUtils.sol`,
      });
      c.setFunctionBody(
        [
          `(bool immediate,) = AuthorityUtils.canCallWithDelay(authority(), caller, address(this), bytes4(_msgData()[0:4]));`,
          `if (!immediate) revert Unauthorized();`,
        ],
        functions._checkTokenBridge,
        'view',
      );
      break;
    }
    default: {
      const _: never = access;
      throw new Error('Unknown value for `access`');
    }
  }
}

function addSuperchainERC20(c: ContractBuilder) {
  c.addVariable('address internal constant SUPERCHAIN_TOKEN_BRIDGE = 0x4200000000000000000000000000000000000028;');
  c.setFunctionBody(
    ['if (caller != SUPERCHAIN_TOKEN_BRIDGE) revert Unauthorized();'],
    functions._checkTokenBridge,
    'pure',
  );
}

export const functions = defineFunctions({
  _update: {
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    comments: [
      '/// @dev Updates the balances of `from` and `to`',
      '/// @param from The address of the sender',
      '/// @param to The address of the recipient',
      '/// @param value The amount of tokens to transfer',
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
    comments: [
      "/// @dev Sets `value` as the allowance of `spender` over the `owner`'s tokens",
      '/// @param owner The address of the token owner',
      '/// @param spender The address of the spender',
      '/// @param value The amount of tokens to approve',
      '/// @param emitEvent Whether to emit the Approval event',
    ],
  },

  mint: {
    kind: 'public' as const,
    args: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    comments: [
      '/// @dev Creates `amount` new tokens for `to`',
      '/// @param to The address that will receive the minted tokens',
      '/// @param amount The amount of tokens to mint',
    ],
  },

  pause: {
    kind: 'public' as const,
    args: [],
    comments: [
      '/// @dev Pauses all token transfers',
      '/// @notice This function can only be called by the contract owner',
    ],
  },

  unpause: {
    kind: 'public' as const,
    args: [],
    comments: [
      '/// @dev Unpauses all token transfers',
      '/// @notice This function can only be called by the contract owner',
    ],
  },

  snapshot: {
    kind: 'public' as const,
    args: [],
    comments: ['/// @dev Creates a new snapshot and returns its id', '/// @return The id of the new snapshot'],
  },

  nonces: {
    kind: 'public' as const,
    args: [{ name: 'owner', type: 'address' }],
    returns: ['uint256'],
    mutability: 'view' as const,
    comments: [
      '/// @dev Returns the current nonce for `owner`',
      '/// @param owner The address to get the nonce for',
      '/// @return The current nonce of the owner',
    ],
  },

  _checkTokenBridge: {
    kind: 'internal' as const,
    args: [{ name: 'caller', type: 'address' }],
    comments: [
      '/// @dev Checks if the caller is a valid token bridge',
      '/// @param caller The address to check',
      '/// @notice This function is used for cross-chain token transfers',
    ],
  },
});
