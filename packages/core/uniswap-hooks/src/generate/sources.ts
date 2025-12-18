import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { printContract, OptionsError, findCover, type Contract } from '@openzeppelin/wizard';
import { generateHooksOptions } from './hooks';
import { buildGeneric, type GenericOptions, type KindedOptions } from '../build-generic';

type Subset = 'all' | 'minimal-cover';

type Kind = keyof KindedOptions;

export function* generateOptions(kind?: Kind): Generator<GenericOptions> {
  if (!kind || kind === 'Hooks') {
    for (const kindOpts of generateHooksOptions()) {
      yield { kind: 'Hooks', ...kindOpts };
    }
  }
}

interface GeneratedContract {
  id: string;
  options: GenericOptions;
  contract: Contract;
}

export interface GeneratedSource extends GeneratedContract {
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
    const getParents = (c: GeneratedContract) => c.contract.parents.map(p => p.contract.path);
    return [...findCover(contracts, getParents)];
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
