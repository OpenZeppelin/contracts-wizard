import { Contract, ContractBuilder } from './contract';
import { Access, setAccessControl, requireAccessControl } from './set-access-control';
import { addPauseFunctions } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, defaults as commonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { printContract } from './print';
import { ClockMode, clockModeDefault, setClockMode } from './set-clock-mode';

export interface StablecoinOptions extends CommonOptions {
  name: string;
  symbol: string;
  burnable?: boolean;
  pausable?: boolean;
  premint?: string;
  mintable?: boolean;
  permit?: boolean;
  limitations?: boolean | "allowlist" | "blocklist";
  /**
   * Whether to keep track of historical balances for voting in on-chain governance, and optionally specify the clock mode.
   * Setting `true` is equivalent to 'blocknumber'. Setting a clock mode implies voting is enabled.
   */
  votes?: boolean | ClockMode;
  flashmint?: boolean;
  custodian?: boolean;
}

export const defaults: Required<StablecoinOptions> = {
  name: 'MyStablecoin',
  symbol: 'MST',
  burnable: false,
  pausable: false,
  premint: '0',
  mintable: false,
  permit: true,
  limitations: false,
  votes: false,
  flashmint: false,
  custodian: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
} as const;

function withDefaults(opts: StablecoinOptions): Required<StablecoinOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    premint: opts.premint || defaults.premint,
    mintable: opts.mintable ?? defaults.mintable,
    permit: opts.permit ?? defaults.permit,
    limitations: opts.limitations ?? defaults.limitations,
    votes: opts.votes ?? defaults.votes,
    flashmint: opts.flashmint ?? defaults.flashmint,
    custodian: opts.custodian ?? defaults.custodian,
  };
}

export function printStablecoin(opts: StablecoinOptions = defaults): string {
  return printContract(buildStablecoin(opts));
}

export function isAccessControlRequired(opts: Partial<StablecoinOptions>): boolean {
  return opts.mintable || opts.limitations !== false || opts.custodian || opts.pausable || opts.upgradeable === 'uups';
}

export function buildStablecoin(opts: StablecoinOptions): Contract {
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

  if (allOpts.limitations) {
    addLimitations(c, access, allOpts.limitations);
  }

  if (allOpts.custodian) {
    addCustodian(c, access);
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
  // setUpgradeable(c, upgradeable, access);
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
  c.addOverride(ERC20, functions._approve);
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
      c.addConstructorCode(`_mint(msg.sender, ${units} * 10 ** ${exp});`);
    }
  }
}

function addMintable(c: ContractBuilder, access: Access) {
  requireAccessControl(c, functions.mint, access, 'MINTER', 'minter');
  c.addFunctionCode('_mint(to, amount);', functions.mint);
}

function addLimitations(c: ContractBuilder, access: Access, mode: boolean | 'allowlist' | 'blocklist') {
  const type = mode === 'allowlist';
  const ERC20Limitation = {
    name: type ? 'ERC20Allowlist' : 'ERC20Blocklist',
    path: `@openzeppelin/community-contracts/contracts/token/ERC20/extensions/${type ? 'ERC20Allowlist' : 'ERC20Blocklist'}.sol`,
  };

  c.addParent(ERC20Limitation);
  c.addOverride(ERC20Limitation, functions._update);
  c.addOverride(ERC20Limitation, functions._approve);

  const [addFn, removeFn] = type 
    ? [functions.allowUser, functions.disallowUser]
    : [functions.blockUser, functions.unblockUser];

  requireAccessControl(c, addFn, access, 'LIMITER', 'limiter');
  c.addFunctionCode(`_${type ? 'allowUser' : 'blockUser'}(user);`, addFn);

  requireAccessControl(c, removeFn, access, 'LIMITER', 'limiter');
  c.addFunctionCode(`_${type ? 'disallowUser' : 'unblockUser'}(user);`, removeFn);
}

function addCustodian(c: ContractBuilder, access: Access) {
  const ERC20Custodian = {
    name: 'ERC20Custodian',
    path: '@openzeppelin/community-contracts/contracts/token/ERC20/extensions/ERC20Custodian.sol',
  };

  c.addParent(ERC20Custodian);
  c.addOverride(ERC20Custodian, functions._update);
  c.addOverride(ERC20Custodian, functions._isCustodian);

  if (access === false) {
    access = 'ownable';
  }
  
  setAccessControl(c, access);

  switch (access) {
    case 'ownable': {
      c.setFunctionBody([`return user == owner();`], functions._isCustodian);
      break;
    }
    case 'roles': {
      const roleOwner = 'custodian';
      const roleId = 'CUSTODIAN_ROLE';
      const addedConstant = c.addVariable(`bytes32 public constant ${roleId} = keccak256("${roleId}");`);
      if (roleOwner && addedConstant) {
        c.addConstructorArgument({type: 'address', name: roleOwner});
        c.addConstructorCode(`_grantRole(${roleId}, ${roleOwner});`);
      }
      c.setFunctionBody([`return hasRole(CUSTODIAN_ROLE, user);`], functions._isCustodian);
      break;
    }
    case 'managed': {
      // TODO: solve below
      // c.addModifier('restricted', functions._isCustodian);
      c.setFunctionBody([`return user == authority();`], functions._isCustodian);
      break;
    }
  }
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

const functions = defineFunctions({
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

  _isCustodian: {
    kind: 'internal' as const,
    args: [
      { name: 'user', type: 'address' },
    ],
    returns: ['bool'],
    mutability: 'view' as const
  },

  mint: {
    kind: 'public' as const,
    args: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },

  allowUser: {
    kind: 'public' as const,
    args: [
      { name: 'user', type: 'address' }
    ],
  },

  disallowUser: {
    kind: 'public' as const,
    args: [
      { name: 'user', type: 'address' }
    ],
  },

  blockUser: {
    kind: 'public' as const,
    args: [
      { name: 'user', type: 'address' }
    ],
  },

  unblockUser: {
    kind: 'public' as const,
    args: [
      { name: 'user', type: 'address' }
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
  }
});
