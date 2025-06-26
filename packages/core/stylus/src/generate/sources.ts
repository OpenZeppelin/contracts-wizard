import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

import { generateERC20Options } from './erc20';
import { generateERC721Options } from './erc721';
import { generateERC1155Options } from './erc1155';
import type { GenericOptions, KindedOptions } from '../build-generic';
import { buildGeneric } from '../build-generic';
import { printContract } from '../print';
import { OptionsError } from '../error';
import type { Contract } from '../contract';
import { findCover } from '../utils/find-cover';

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
    const id = crypto.createHash('sha1').update(JSON.stringify(options)).digest().toString('hex');

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
    const getParents = (c: GeneratedContract) =>
      c.contract.implementedTraits.map(p => `${p.modulePath}::${p.interface}`);
    return [...findCover(contracts, getParents)];
  }
}

export function* generateSources(subset: Subset, uniqueName?: boolean, kind?: Kind): Generator<GeneratedSource> {
  let counter = 1;
  for (const c of generateContractSubset(subset, kind)) {
    if (uniqueName) {
      c.contract.name.identifier = `Contract${counter++}`;
    }
    const source = printContract(c.contract);
    yield { ...c, source };
  }
}

export async function writeGeneratedSources(
  dir: string,
  subset: Subset,
  uniqueName?: boolean,
  kind?: Kind,
): Promise<string[]> {
  await fs.mkdir(dir, { recursive: true });
  const contractNames = [];

  for (const { id, contract, source } of generateSources(subset, uniqueName, kind)) {
    const name = uniqueName ? contract.name.identifier : id;
    await fs.writeFile(path.format({ dir, name, ext: '.rs' }), source);
    contractNames.push(name);
  }

  return contractNames;
}
