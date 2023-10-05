import path from 'path';

import type { Contract, ReferencedContract, ParentContract } from './contract';
import { inferTranspiled } from './infer-transpiled';

const upgradeableName = (n: string) => {
  if (n === 'Initializable') {
    return n;
  } else {
    return n.replace(/(Upgradeable)?(?=\.|$)/, 'Upgradeable');
  }
}

const upgradeableImport = (p: ParentContract): ParentContract => {
  const { dir, ext, name } = path.parse(p.path);
  // Use path.posix to get forward slashes
  return {
    ...p,
    path: path.posix.format({
      ext,
      dir: dir.replace(/^@openzeppelin\/contracts/, '@openzeppelin/contracts-upgradeable'),
      name: upgradeableName(name),
    }),
  }
};

export interface Options {
  transformImport?: (parent: ParentContract) => ParentContract;
}

export interface Helpers extends Required<Options> {
  upgradeable: boolean;
  transformName: (name: ReferencedContract) => string;
}

export function withHelpers(contract: Contract, opts: Options = {}): Helpers {
  const contractUpgradeable = contract.upgradeable;
  const transformName = (n: ReferencedContract) => contractUpgradeable && inferTranspiled(n) ? upgradeableName(n.name) : n.name;
  return {
    upgradeable: contractUpgradeable,
    transformName,
    transformImport: p1 => {
      const p2 = contractUpgradeable && inferTranspiled(p1) ? upgradeableImport(p1) : p1;
      return opts.transformImport?.(p2) ?? p2;
    },
  };
}
