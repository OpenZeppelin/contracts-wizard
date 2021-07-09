import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

import { generateERC20Options } from './erc20';
import { generateERC721Options } from './erc721';
import { generateERC1155Options } from './erc1155';
import { buildGeneric, GenericOptions } from '../build-generic';
import { printContract } from '../print';

function* generateOptions(): Generator<GenericOptions> {
  for (const kindOpts of generateERC20Options()) {
    yield { kind: 'ERC20', ...kindOpts };
  }

  for (const kindOpts of generateERC721Options()) {
    yield { kind: 'ERC721', ...kindOpts };
  }
  for (const kindOpts of generateERC1155Options()) {
    yield { kind: 'ERC1155', ...kindOpts };
  }
}

export async function writeGeneratedSources(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });

  for (const buildOpts of generateOptions()) {
    for (const printOpts of [{}, { upgradeable: true }]) {
      const source = printContract(buildGeneric(buildOpts), printOpts);

      const name = crypto
        .createHash('sha1')
        .update(JSON.stringify({ buildOpts, printOpts }))
        .digest()
        .toString('hex');

      await fs.writeFile(path.format({ dir, name, ext: '.sol' }), source);
    }
  }
}
