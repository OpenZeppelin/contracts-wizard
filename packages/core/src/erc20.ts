import { Contract, ContractBuilder } from './contract';

export interface ERC20Options {
  name: string;
  symbol: string;
  burnable?: boolean;
  snapshots?: boolean;
  pausable?: boolean;
  premint?: string;
  mintable?: boolean;
}

export function buildERC20(opts: ERC20Options): Contract {
  const c = new ContractBuilder(opts.name);

  addBase(c, opts.name, opts.symbol);

  if (opts.burnable) {
    addBurnable(c);
  }

  if (opts.snapshots) {
    addSnapshot(c);
  }

  if (opts.pausable) {
    addPausable(c);
  }

  if (opts.premint) {
    addPremint(c, opts.premint);
  }

  if (opts.mintable) {
    addMintable(c);
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

function addSnapshot(c: ContractBuilder) {
  c.addParent({
    name: 'ERC20Snapshot',
    path: '@openzeppelin/contracts/token/ERC20/ERC20Snapshot.sol',
  });

  c.addOverride('ERC20Snapshot', functions._beforeTokenTransfer);
}

function addPausable(c: ContractBuilder) {
  c.addParent({
    name: 'Pausable',
    path: '@openzeppelin/contracts/utils/Pausable.sol',
  });

  c.addModifier('whenNotPaused', functions._beforeTokenTransfer);
}

function addPremint(c: ContractBuilder, amount: string) {
  c.addConstructorCode(`_mint(msg.sender, ${amount});`);
}

function addMintable(c: ContractBuilder) {
  c.addParent({
    name: 'Ownable',
    path: '@openzeppelin/contracts/access/Ownable.sol',
  });
  c.addFunctionCode('_mint(to, amount);', functions.mint);
  c.addModifier('onlyOwner', functions.mint);
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
};
