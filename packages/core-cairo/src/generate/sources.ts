import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

import { generateERC20Options } from './erc20';
import { generateERC721Options } from './erc721';
import { buildGeneric, GenericOptions } from '../build-generic';
import { printContract } from '../print';
import { OptionsError } from '../error';
import { findCover } from '../utils/find-cover';
import type { Contract } from '../contract';

type Subset = 'all' | 'minimal-cover';

export function* generateOptions(): Generator<GenericOptions> {
  for (const kindOpts of generateERC20Options()) {
    yield { kind: 'ERC20', ...kindOpts };
  }

  for (const kindOpts of generateERC721Options()) {
    yield { kind: 'ERC721', ...kindOpts };
  }
}

interface GeneratedContract {
  id: string;
  options: GenericOptions;
  contract: Contract;
}

interface GeneratedSource extends GeneratedContract {
  source: string;
}

function generateContractSubset(subset: Subset): GeneratedContract[] {
  const contracts = [];

  for (const options of generateOptions()) {
    const id = crypto
      .createHash('sha1')
      .update(JSON.stringify(options))
      .digest()
      .toString('hex');

    try {
      const contract = buildGeneric(options);
      contracts.push({ id, options, contract });
    } catch (e: unknown) {
      if (e instanceof OptionsError) {
        continue;
      } else {
        throw e;
      }
    }
  }

  if (subset === 'all') {
    return contracts;
  } else {
    const getParents = (c: GeneratedContract) => c.contract.libraries.map(p => p.module.path);
    return [
      ...findCover(contracts.filter(c => c.options.upgradeable), getParents),
      ...findCover(contracts.filter(c => !c.options.upgradeable), getParents),
    ];
  }
}

export function* generateSources(subset: Subset): Generator<GeneratedSource> {
  for (const c of generateContractSubset(subset)) {
    const source = printContract(c.contract);
    yield { ...c, source };
  }
}

export async function writeGeneratedSources(dir: string, subset: Subset): Promise<void> {
  await fs.mkdir(dir, { recursive: true });

  for (const { id, source } of generateSources(subset)) {
    await fs.writeFile(path.format({ dir, name: id, ext: '.cairo' }), source);
  }
}
