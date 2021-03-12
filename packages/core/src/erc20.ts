import { Contract, ContractBuilder, BaseFunction } from './contract';

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

type Access = 'ownable' | 'roles';

export function buildERC20(opts: ERC20Options): Contract {
  const c = new ContractBuilder(opts.name);

  const { access = 'ownable' } = opts;

  addBase(c, opts.name, opts.symbol);

  if (opts.burnable) {
    addBurnable(c);
  }

  if (opts.snapshots) {
    addSnapshot(c);
  }

  if (opts.pausable) {
    addPausable(c, access);
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

function addSnapshot(c: ContractBuilder) {
  c.addParent({
    name: 'ERC20Snapshot',
    path: '@openzeppelin/contracts/token/ERC20/ERC20Snapshot.sol',
  });

  c.addOverride('ERC20Snapshot', functions._beforeTokenTransfer);
}

function addPausable(c: ContractBuilder, access: Access) {
  c.addParent({
    name: 'Pausable',
    path: '@openzeppelin/contracts/utils/Pausable.sol',
  });

  c.addModifier('whenNotPaused', functions._beforeTokenTransfer);

  setAccessControl(c, functions.pause, access, 'PAUSER');
  c.addFunctionCode('_pause();', functions.pause);
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

function setAccessControl(c: ContractBuilder, fn: BaseFunction, access: Access, role: string) {
  switch (access) {
    case 'ownable': {
      c.addParent(parents.Ownable);
      c.addModifier('onlyOwner', fn);
      break;
    }
    case 'roles': {
      const roleId = role + '_ROLE';
      c.addParent(parents.AccessControl);
      c.addVariable(`bytes32 public constant ${roleId} = keccak256("${roleId}");`);
      c.addFunctionCode(`require(hasRole(${roleId}, msg.sender));`, fn);
      break;
    }
  }
}

const parents = {
  Ownable: {
    name: 'Ownable',
    path: '@openzeppelin/contracts/access/Ownable.sol',
  },
  AccessControl: {
    name: 'AccessControl',
    path: '@openzeppelin/contracts/access/AccessControl.sol',
  },
};

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
};
