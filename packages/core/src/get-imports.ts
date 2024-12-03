import type { Contract } from './contract';
import { reachable } from './utils/transitive-closure';

import contracts from '../openzeppelin-contracts';
import { withHelpers } from './options';

/**
 * Gets the source code for all imports of a contract, including all transitive dependencies.
 *
 * Does not include the contract itself (use `printContract` for that if needed).
 *
 * @param c The contract to get imports for.
 * @returns A record of import paths to source code.
 */
export function getImports(c: Contract): Record<string, string> {
  const { transformImport } = withHelpers(c);

  const result: Record<string, string> = {};

  const fileName = c.name + '.sol';

  const dependencies = {
    [fileName]: c.imports.map(i => transformImport(i).path),
    ...contracts.dependencies,
  };

  const allImports = reachable(dependencies, fileName);

  for (const importPath of allImports) {
    const source = contracts.sources[importPath];
    if (source === undefined) {
      throw new Error(`Source for ${importPath} not found`);
    }
    result[importPath] = source;
  }

  return result;
}