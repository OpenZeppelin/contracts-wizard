import fs from 'fs';
import JSZip from 'jszip';

import type { Contract, Parent, ContractFunction, FunctionArgument } from './contract';
import { printContract } from './print';
import { reachable } from './utils/transitive-closure';

import contracts from '../openzeppelin-contracts';

export function zipContract(c: Contract): JSZip {
  const fileName = c.name + '.sol';

  const dependencies = {
    [fileName]: c.parents.map(p => p.contract.path),
    ...contracts.dependencies,
  };

  const allImports = reachable(dependencies, fileName);

  const zip = new JSZip();

  zip.file(fileName, printContract(c, { transformImport: p => './' + p }));

  for (const importPath of allImports) {
    const source = contracts.sources[importPath];
    if (source === undefined) {
      throw new Error(`Source for ${importPath} not found`);
    }
    zip.file(importPath, source);
  }

  return zip;
}
