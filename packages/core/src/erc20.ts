import { Contract, ContractBuilder } from './contract';
import { Access, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';

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
}

export function buildERC20(opts: ERC20Options): Contract {
  const c = new ContractBuilder(opts.name);

  const { access, upgradeable } = withCommonDefaults(opts);

  addBase(c, opts.name, opts.symbol);

  if (opts.burnable) {
    addBurnable(c);
  }

  if (opts.snapshots) {
    addSnapshot(c, access);
  }

  if (opts.pausable) {
    addPausable(c, access, [functions._beforeTokenTransfer]);
  }

  if (opts.premint) {
    addPremint(c, opts.premint);
  }

  if (opts.mintable) {
    addMintable(c, access);
  }

  // Note: Votes requires Permit
  if (opts.permit || opts.votes) {
    addPermit(c, opts.name);
  }

  if (opts.votes) {
    addVotes(c);
  }

  if (opts.flashmint) {
    addFlashMint(c);
  }

  setUpgradeable(c, upgradeable, access);

  return c;
}

function addBase(c: ContractBuilder, name: string, symbol: string) {
  c.addParent(
    {
      name: 'ERC20',
      path: '@openzeppelin/contracts/token/ERC20/ERC20.sol',
    },
    [name, symbol],
  );

  c.addOverride('ERC20', functions._beforeTokenTransfer);
  c.addOverride('ERC20', functions._afterTokenTransfer);
  c.addOverride('ERC20', functions._mint);
  c.addOverride('ERC20', functions._burn);
}

function addBurnable(c: ContractBuilder) {
  c.addParent({
    name: 'ERC20Burnable',
    path: '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol',
  });
}

function addSnapshot(c: ContractBuilder, access: Access) {
  c.addParent({
    name: 'ERC20Snapshot',
    path: '@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol',
  });

  c.addOverride('ERC20Snapshot', functions._beforeTokenTransfer);

  setAccessControl(c, functions.snapshot, access, 'SNAPSHOT');
  c.addFunctionCode('_snapshot();', functions.snapshot);
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
  setAccessControl(c, functions.mint, access, 'MINTER');
  c.addFunctionCode('_mint(to, amount);', functions.mint);
}

function addPermit(c: ContractBuilder, name: string) {
  c.addParent({
    name: 'ERC20Permit',
    path: '@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol',
  }, [name]);
}

function addVotes(c: ContractBuilder) {
  if (!c.parents.some(p => p.contract.name === 'ERC20Permit')) {
    throw new Error('Missing ERC20Permit requirement for ERC20Votes');
  }

  c.addParent({
    name: 'ERC20Votes',
    path: '@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol',
  });
  c.addOverride('ERC20Votes', functions._mint);
  c.addOverride('ERC20Votes', functions._burn);
  c.addOverride('ERC20Votes', functions._afterTokenTransfer);
}

function addFlashMint(c: ContractBuilder) {
  c.addParent({
    name: 'ERC20FlashMint',
    path: '@openzeppelin/contracts/token/ERC20/extensions/ERC20FlashMint.sol',
  });
}

const functions = defineFunctions({
  _beforeTokenTransfer: {
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },

  _afterTokenTransfer: {
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },

  _burn: {
    kind: 'internal' as const,
    args: [
      { name: 'account', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },

  _mint: {
    kind: 'internal' as const,
    args: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
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
});
