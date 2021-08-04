import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

import { generateERC20Options } from './erc20';
import { generateERC721Options } from './erc721';
import { generateERC1155Options } from './erc1155';
import { buildGeneric, GenericOptions } from '../build-generic';
import { printContract } from '../print';
import { generateGovernorOptions } from './governor';
import { OptionsError } from '../error';

type Subset = 'all' | 'only-maximal';

export function* generateOptions(subset: Subset): Generator<GenericOptions> {
  const forceTrue = subset === 'only-maximal';

  for (const kindOpts of generateERC20Options(forceTrue)) {
    yield { kind: 'ERC20', ...kindOpts };
  }

  for (const kindOpts of generateERC721Options(forceTrue)) {
    yield { kind: 'ERC721', ...kindOpts };
  }

  for (const kindOpts of generateERC1155Options(forceTrue)) {
    yield { kind: 'ERC1155', ...kindOpts };
  }

  for (const kindOpts of generateGovernorOptions()) {
    yield { kind: 'Governor', ...kindOpts };
  }
}

interface GeneratedSource {
  id: string;
  options: GenericOptions;
  source: string;
}

export function* generateSources(subset: Subset): Generator<GeneratedSource> {
  for (const options of generateOptions(subset)) {
    try {
      const source = printContract(buildGeneric(options));

      const id = crypto
        .createHash('sha1')
        .update(JSON.stringify(options))
        .digest()
        .toString('hex');

      yield { id, source, options };
    } catch (e: unknown) {
      if (e instanceof OptionsError) {
        continue;
      } else {
        throw e;
      }
    }
  }
}

export async function writeGeneratedSources(dir: string, subset: Subset): Promise<void> {
  await fs.mkdir(dir, { recursive: true });

  for (const { id, source } of generateSources(subset)) {
    await fs.writeFile(path.format({ dir, name: id, ext: '.sol' }), source);
  }
}
