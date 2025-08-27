import type { Contract } from '../contract';

export function importsLibrary(contract: Contract, library: string) {
  return contract.imports.some(i => i.path.startsWith(library));
}