import { Contract, ContractBuilder } from './contract';

interface ERC20Options {
  name: string;
  symbol: string;
  burnable?: boolean;
  snapshots?: boolean;
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
};
