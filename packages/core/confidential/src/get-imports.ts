import type { Contract } from './contract';
import { reachable } from './utils/transitive-closure';

import contracts from '../openzeppelin-contracts';
import { withHelpers } from './options';

export interface SolcInputSources {
  [source: string]: {
    content: string;
  };
}

/**
 * Gets the source code for all imports of a contract, including all transitive dependencies,
 * in a format compatible with the Solidity compiler input's `sources` field.
 *
 * Does not include the contract itself (use `printContract` for that if needed).
 *
 * @param c The contract to get imports for.
 * @returns A record of import paths to `content` that contains the source code for each contract.
 */
export function getImports(c: Contract): SolcInputSources {
  const { transformImport } = withHelpers(c);

  const result: SolcInputSources = {};

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
    result[importPath] = { content: source };
  }

  return result;
}
