import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

import { generateERC20Options } from './erc20';
import { generateERC721Options } from './erc721';
import { generateERC1155Options } from './erc1155';
import { generateGovernorOptions } from './governor';
import { generateCustomOptions } from './custom';
import { buildGeneric, GenericOptions, KindedOptions } from '../build-generic';
import { printContract } from '../print';
import { OptionsError } from '../error';
import { findCover } from '../utils/find-cover';
import type { Contract } from '../contract';

type Subset = 'all' | 'minimal-cover';

type Kind = keyof KindedOptions;

export function* generateOptions(kind?: Kind): Generator<GenericOptions> {
  if (!kind || kind === 'ERC20') {
    for (const kindOpts of generateERC20Options()) {
      yield { kind: 'ERC20', ...kindOpts };
    }
  }

  if (!kind || kind === 'ERC721') {
    for (const kindOpts of generateERC721Options()) {
      yield { kind: 'ERC721', ...kindOpts };
    }
  }

  if (!kind || kind === 'ERC1155') {
    for (const kindOpts of generateERC1155Options()) {
      yield { kind: 'ERC1155', ...kindOpts };
    }
  }

  if (!kind || kind === 'Governor') {
    for (const kindOpts of generateGovernorOptions()) {
      yield { kind: 'Governor', ...kindOpts };
    }
  }

  if (!kind || kind === 'Custom') {
    for (const kindOpts of generateCustomOptions()) {
      yield { kind: 'Custom', ...kindOpts };
    }
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

function generateContractSubset(subset: Subset, kind?: Kind): GeneratedContract[] {
  const contracts = [];

  for (const options of generateOptions(kind)) {
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
    const getParents = (c: GeneratedContract) => c.contract.parents.map(p => p.contract.path);
    return [
      ...findCover(contracts.filter(c => c.options.upgradeable), getParents),
      ...findCover(contracts.filter(c => !c.options.upgradeable), getParents),
    ];
  }
}

export function* generateSources(subset: Subset, kind?: Kind): Generator<GeneratedSource> {
  for (const c of generateContractSubset(subset, kind)) {
    const source = printContract(c.contract);
    yield { ...c, source };
  }
}

export async function writeGeneratedSources(dir: string, subset: Subset, kind?: Kind): Promise<void> {
  await fs.mkdir(dir, { recursive: true });

  for (const { id, source } of generateSources(subset, kind)) {
    await fs.writeFile(path.format({ dir, name: id, ext: '.sol' }), source);
  }
}
