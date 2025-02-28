import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

import { generateERC20Options } from './erc20';
import type { GenericOptions, KindedOptions } from '../build-generic';
import { buildGeneric } from '../build-generic';
import { printContract } from '../print';
import { OptionsError } from '../error';
import type { Contract } from '../contract';

type Kind = keyof KindedOptions;

export function* generateOptions(kind?: Kind): Generator<GenericOptions> {
  if (!kind || kind === 'ERC20') {
    for (const kindOpts of generateERC20Options()) {
      yield { kind: 'ERC20', ...kindOpts };
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

function generateContractSubset(kind?: Kind): GeneratedContract[] {
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

  return contracts;
}

export function* generateSources(uniqueName?: boolean, kind?: Kind): Generator<GeneratedSource> {
  let counter = 1;
  for (const c of generateContractSubset(kind)) {
    if (uniqueName) {
      c.contract.name = `Contract${counter++}`;
    }
    const source = printContract(c.contract);
    yield { ...c, source };
  }
}

export async function writeGeneratedSources(dir: string, uniqueName?: boolean, kind?: Kind): Promise<string[]> {
  await fs.mkdir(dir, { recursive: true });
  const contractNames = [];

  for (const { id, contract, source } of generateSources(uniqueName, kind)) {
    const name = uniqueName ? contract.name : id;
    await fs.writeFile(path.format({ dir, name, ext: '.rs' }), source);
    contractNames.push(name);
  }

  return contractNames;
}
