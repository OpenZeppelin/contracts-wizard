import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

import { generateERC20Options } from './erc20';
import { generateERC721Options } from './erc721';
import { generateERC1155Options } from './erc1155';
import { buildGeneric } from '../build-generic';
import { printContract } from '../print';

function* generateSources(): Generator<string> {
  for (const opts of generateERC20Options()) {
    yield printContract(buildGeneric({ kind: 'ERC20', ...opts }));
  }

  for (const opts of generateERC721Options()) {
    yield printContract(buildGeneric({ kind: 'ERC721', ...opts }));
  }
  for (const opts of generateERC1155Options()) {
    yield printContract(buildGeneric({ kind: 'ERC1155', ...opts }));
  }
}

export async function writeGeneratedSources(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });

  for (const source of generateSources()) {
    const name = crypto
      .createHash('sha1')
      .update(source)
      .digest()
      .toString('hex');

    await fs.writeFile(path.format({ dir, name, ext: '.sol' }), source);
  }
}
