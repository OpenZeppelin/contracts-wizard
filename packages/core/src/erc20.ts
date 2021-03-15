import { Contract, ContractBuilder, BaseFunction } from './contract';
import { Access, setAccessControl } from './access';
import { addPausable } from './pausable';

export interface ERC20Options {
  name: string;
  symbol: string;
  burnable?: boolean;
  snapshots?: boolean;
  pausable?: boolean;
  premint?: number | string;
  mintable?: boolean;
  access?: Access;
}

export function buildERC20(opts: ERC20Options): Contract {
  const c = new ContractBuilder(opts.name);

  const { access = 'ownable' } = opts;

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
}

function addBurnable(c: ContractBuilder) {
  c.addParent({
    name: 'ERC20Burnable',
    path: '@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol',
  });
}

function addSnapshot(c: ContractBuilder, access: Access) {
  c.addParent({
    name: 'ERC20Snapshot',
    path: '@openzeppelin/contracts/token/ERC20/ERC20Snapshot.sol',
  });

  c.addOverride('ERC20Snapshot', functions._beforeTokenTransfer);

  setAccessControl(c, functions.snapshot, access, 'SNAPSHOT');
  c.addFunctionCode('_snapshot();', functions.snapshot);
}

function addPremint(c: ContractBuilder, amount: number | string) {
  if (Number(amount) > 0) {
    c.addConstructorCode(`_mint(msg.sender, ${amount});`);
  }
}

function addMintable(c: ContractBuilder, access: Access) {
  setAccessControl(c, functions.mint, access, 'MINTER');
  c.addFunctionCode('_mint(to, amount);', functions.mint);
}

const functions = {
  _beforeTokenTransfer: {
    name: '_beforeTokenTransfer',
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },

  mint: {
    name: 'mint',
    kind: 'public' as const,
    args: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },

  pause: {
    name: 'pause',
    kind: 'public' as const,
    args: [],
  },

  unpause: {
    name: 'unpause',
    kind: 'public' as const,
    args: [],
  },

  snapshot: {
    name: 'snapshot',
    kind: 'public' as const,
    args: [],
  },
};
