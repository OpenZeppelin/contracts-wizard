import type { Contract } from '../contract';

export function importsLibrary(contract: Pick<Contract, 'imports'>, library: string) {
  return contract.imports.some(i => i.path.startsWith(library));
}
