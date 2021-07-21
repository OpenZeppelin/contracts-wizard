import path from 'path';

import type { Contract } from './contract';

const upgradeableName = (n: string) => {
  if (n === 'Initializable') {
    return n;
  } else {
    return n.replace(/(Upgradeable)?(?=\.|$)/, 'Upgradeable');
  }
}

const upgradeableImport = (p: string) => {
  const { dir, ext, name } = path.parse(p);
  // Use path.posix to get forward slashes
  return path.posix.format({
    ext,
    dir: dir.replace(/^@openzeppelin\/contracts/, '@openzeppelin/contracts-upgradeable'),
    name: upgradeableName(name),
  });
};

export interface Options {
  transformImport?: (path: string) => string;
}

export interface Helpers extends Required<Options> {
  upgradeable: boolean;
  transformName: (name: string) => string;
  transformVariable: (code: string) => string;
}

export function withHelpers(contract: Contract, opts: Options = {}): Helpers {
  const upgradeable = contract.upgradeable;
  const transformName = (n: string) => upgradeable ? upgradeableName(n) : n;
  return {
    upgradeable,
    transformName,
    transformImport: p1 => {
      const p2 = upgradeable ? upgradeableImport(p1) : p1;
      return opts.transformImport?.(p2) ?? p2;
    },
    transformVariable: v => v.replace(/[A-Z]\w*(?=\.|$)/, transformName),
  };
}
