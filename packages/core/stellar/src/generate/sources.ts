import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

import { generateFungibleOptions } from './fungible';
import { buildGeneric, GenericOptions, KindedOptions } from '../build-generic';
import { printContract } from '../print';
import { OptionsError } from '../error';
import { findCover } from '../utils/find-cover';
import type { Contract } from '../contract';

type Subset = 'all' | 'minimal-cover';

type Kind = keyof KindedOptions;

export function* generateOptions(kind?: Kind): Generator<GenericOptions> {
  if (!kind || kind === 'Fungible') {
    for (const kindOpts of generateFungibleOptions()) {
      yield { kind: 'Fungible', ...kindOpts };
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
    const getParents = (c: GeneratedContract) => c.contract.components.map(p => p.path);
    function filterByUpgradeableSetTo(isUpgradeable: boolean) {
      return (c: GeneratedContract) => {
        switch (c.options.kind) {
          case 'Fungible':
            return c.options.upgradeable === isUpgradeable;
          default:
            const _: never = c.options.kind; // TODO: When there are additional kinds above, change this assignment to just `c.options` instead of `c.options.kind`
            throw new Error('Unknown kind');
        }
      }
    }
    return [
      ...findCover(contracts.filter(filterByUpgradeableSetTo(true)), getParents),
      ...findCover(contracts.filter(filterByUpgradeableSetTo(false)), getParents),
    ];
  }
}

export function* generateSources(subset: Subset, uniqueName?: boolean, kind?: Kind): Generator<GeneratedSource> {
  let counter = 1;
  for (const c of generateContractSubset(subset, kind)) {
    if (uniqueName) {
      c.contract.name = `Contract${counter++}`;
    }
    const source = printContract(c.contract);
    yield { ...c, source };
  }
}

export async function writeGeneratedSources(dir: string, subset: Subset, uniqueName?: boolean, kind?: Kind): Promise<string[]> {
  await fs.mkdir(dir, { recursive: true });
  let contractNames = [];

  for (const { id, contract, source } of generateSources(subset, uniqueName, kind)) {
    const name = uniqueName ? contract.name : id;
    await fs.writeFile(path.format({ dir, name, ext: '.cairo' }), source);
    contractNames.push(name);
  }

  return contractNames;
}
