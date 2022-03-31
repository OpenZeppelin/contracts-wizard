import type { Contract } from './contract';

function convertPathToImport(relativePath: string): string {
	return relativePath.split('/').join('.');
}

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
  const transformName = (n: string) => n; //upgradeable ? upgradeableName(n) : n;
  return {
    upgradeable,
    transformName,
    transformImport: p1 => {
      return convertPathToImport(p1);
      //const p2 = upgradeable ? upgradeableImport(p1) : p1;
      //return opts.transformImport?.(p2) ?? p2;
    },
    transformVariable: v => v.replace(/[A-Z]\w*(?=\.|$)/, transformName),
  };
}
