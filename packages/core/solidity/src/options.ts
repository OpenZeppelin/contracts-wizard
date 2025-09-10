import path from 'path';

import type { Contract, ReferencedContract, ImportContract } from './contract';
import { inferTranspiled } from './infer-transpiled';

export function upgradeableName(n: string) {
  if (n === 'Initializable') {
    return n;
  } else {
    return n.replace(/(Upgradeable)?(?=\.|$)/, 'Upgradeable');
  }
}

export function upgradeableImport(p: ImportContract): ImportContract {
  const { dir, ext, name } = path.parse(p.path);
  // Use path.posix to get forward slashes
  return {
    ...p,
    name: upgradeableName(p.name), // Contract name
    path: path.posix.format({
      ext,
      dir: dir.replace(/^@openzeppelin\/contracts/, '@openzeppelin/contracts-upgradeable'),
      name: upgradeableName(name), // Solidity file name
    }),
  };
}

export interface Options {
  transformImport?: (parent: ImportContract) => ImportContract;
}

export interface Helpers extends Required<Options> {
  upgradeable: boolean;
  transformName: (name: ReferencedContract) => string;
  transformImport: (name: ImportContract) => ImportContract;
}

export function withHelpers(contract: Contract, opts: Options = {}): Helpers {
  const contractUpgradeable = contract.upgradeable;
  return {
    upgradeable: contractUpgradeable,
    transformName: (n: ReferencedContract) =>
      contractUpgradeable && inferTranspiled(n) ? upgradeableName(n.name) : n.name,
    transformImport: (p1: ImportContract) => {
      const p2 = contractUpgradeable && inferTranspiled(p1) ? upgradeableImport(p1) : p1;
      return opts.transformImport?.(p2) ?? p2;
    },
  };
}
