import type { Contract } from './contract';

function convertPathToImport(relativePath: string): string {
	return relativePath.split('/').join('.');
}

export interface Options {
  transformImport?: (path: string) => string;
}

export interface Helpers extends Required<Options> {
  upgradeable: boolean;
}

export function withHelpers(contract: Contract): Helpers {
  const upgradeable = contract.upgradeable;
  return {
    upgradeable,
    transformImport: p1 => {
      return convertPathToImport(p1);
    },
  };
}
