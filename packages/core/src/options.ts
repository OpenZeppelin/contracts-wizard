import path from 'path';

import type { Contract, ParentContract } from './contract';

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
  transformName: (name: string) => string;
  transformVariable: (code: string) => string;
}

export function withHelpers(contract: Contract, opts: Options = {}): Helpers {
  const contractUpgradeable = contract.upgradeable;
  const transformName = (n: string) => contractUpgradeable ? upgradeableName(n) : n;
  return {
    upgradeable: contractUpgradeable,
    transformName,
    transformImport: p1 => {
      const p2 = contractUpgradeable && p1.transpiled ? upgradeableImport(p1) : p1;
      return opts.transformImport?.(p2) ?? p2;
    },
    transformVariable: v => v.replace(/[A-Z]\w*(?=\.|$)/, transformName),
  };
}
