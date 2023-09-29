import JSZip from 'jszip';

import type { Contract } from './contract';
import { printContract } from './print';
import { reachable } from './utils/transitive-closure';

import contracts from '../openzeppelin-contracts';
import { withHelpers } from './options';

const readme = (variant: string) => `\
# OpenZeppelin Contracts

The files in this directory were sourced unmodified from OpenZeppelin Contracts v${contracts.version}.

They are not meant to be edited.

The originals can be found on [GitHub] and [npm].

[GitHub]: https://github.com/OpenZeppelin/openzeppelin-contracts${variant}/tree/v${contracts.version}
[npm]: https://www.npmjs.com/package/@openzeppelin/contracts${variant}/v/${contracts.version}

Generated with OpenZeppelin Contracts Wizard (https://zpl.in/wizard).
`;

export function zipContract(c: Contract): JSZip {
  const { transformImport } = withHelpers(c);

  const fileName = c.name + '.sol';

  const dependencies = {
    [fileName]: c.imports.map(i => transformImport(i).path),
    ...contracts.dependencies,
  };

  const allImports = reachable(dependencies, fileName);

  const zip = new JSZip();

  zip.file(fileName, printContract(c, {
    transformImport: p => {
      return {
        ...p,
        path: './' + p.path
      }
    }
  }));

  addReadmeIfImportsVariant(zip, allImports, '');
  addReadmeIfImportsVariant(zip, allImports, '-upgradeable');

  for (const importPath of allImports) {
    const source = contracts.sources[importPath];
    if (source === undefined) {
      throw new Error(`Source for ${importPath} not found`);
    }
    zip.file(importPath, source);
  }

  return zip;
}

function addReadmeIfImportsVariant(zip: JSZip, allImports: Set<string>, variant: string) {
  const hasVariant = Array.from(allImports).some((importPath) => {
    return importPath.startsWith(`@openzeppelin/contracts${variant}/`);
  });
  if (hasVariant) {
    zip.file(`@openzeppelin/contracts${variant}/README.md`, readme(variant));
  }
}