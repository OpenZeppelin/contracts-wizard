import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

import { generateERC20Options } from './erc20';
import { generateERC721Options } from './erc721';
import { generateERC1155Options } from './erc1155';
import { generateAccountOptions } from './account';
import { generateCustomOptions } from './custom';
import { generateGovernorOptions } from './governor';
import { generateMultisigOptions } from './multisig';
import { generateVestingOptions } from './vesting';
import type { GenericOptions, KindedOptions } from '../build-generic';
import { buildGeneric } from '../build-generic';
import { printContract } from '../print';
import { OptionsError } from '../error';
import { findCover } from '../utils/find-cover';
import type { Contract } from '../contract';
import type { RoyaltyInfoSubset } from '../set-royalty-info';

export type Subset = 'all' | 'minimal-cover';

export type KindSubset = 'all' | keyof KindedOptions;

export function* generateOptions(params: {
  kind: KindSubset;
  royaltyInfo: RoyaltyInfoSubset;
}): Generator<GenericOptions> {
  const { kind, royaltyInfo } = params;
  if (kind === 'all' || kind === 'ERC20') {
    for (const kindOpts of generateERC20Options()) {
      yield { kind: 'ERC20', ...kindOpts };
    }
  }

  if (kind === 'all' || kind === 'ERC721') {
    for (const kindOpts of generateERC721Options({ royaltyInfo })) {
      yield { kind: 'ERC721', ...kindOpts };
    }
  }

  if (kind === 'all' || kind === 'ERC1155') {
    for (const kindOpts of generateERC1155Options({ royaltyInfo })) {
      yield { kind: 'ERC1155', ...kindOpts };
    }
  }

  if (kind === 'all' || kind === 'Account') {
    for (const kindOpts of generateAccountOptions()) {
      yield { kind: 'Account', ...kindOpts };
    }
  }

  if (kind === 'all' || kind === 'Multisig') {
    for (const kindOpts of generateMultisigOptions()) {
      yield { kind: 'Multisig', ...kindOpts };
    }
  }

  if (kind === 'all' || kind === 'Governor') {
    for (const kindOpts of generateGovernorOptions()) {
      yield { kind: 'Governor', ...kindOpts };
    }
  }

  if (kind === 'all' || kind === 'Vesting') {
    for (const kindOpts of generateVestingOptions()) {
      yield { kind: 'Vesting', ...kindOpts };
    }
  }

  if (kind === 'all' || kind === 'Custom') {
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

function generateContractSubset(params: {
  subset: Subset;
  kind: KindSubset;
  royaltyInfo: RoyaltyInfoSubset;
}): GeneratedContract[] {
  const { subset, kind, royaltyInfo } = params;
  const contracts = [];

  for (const options of generateOptions({ kind, royaltyInfo })) {
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
    const getParents = (c: GeneratedContract) => c.contract.components.map(p => p.path);
    function filterByUpgradeableSetTo(isUpgradeable: boolean) {
      return (c: GeneratedContract) => {
        switch (c.options.kind) {
          case 'Vesting':
            return isUpgradeable === false;
          case 'ERC20':
          case 'ERC721':
          case 'ERC1155':
          case 'Account':
          case 'Multisig':
          case 'Governor':
          case 'Custom':
            return c.options.upgradeable === isUpgradeable;
          default: {
            const _: never = c.options;
            throw new Error('Unknown kind');
          }
        }
      };
    }
    return [
      ...findCover(contracts.filter(filterByUpgradeableSetTo(true)), getParents),
      ...findCover(contracts.filter(filterByUpgradeableSetTo(false)), getParents),
    ];
  }
}

export function* generateSources(params: {
  subset: Subset;
  uniqueName: boolean;
  kind: KindSubset;
  royaltyInfo: RoyaltyInfoSubset;
}): Generator<GeneratedSource> {
  const { subset, uniqueName, kind, royaltyInfo } = params;
  let counter = 1;
  for (const c of generateContractSubset({ subset, kind, royaltyInfo })) {
    if (uniqueName) {
      c.contract.name = `Contract${counter++}`;
    }
    const source = printContract(c.contract);
    yield { ...c, source };
  }
}

export async function writeGeneratedSources(params: {
  dir: string;
  subset: Subset;
  uniqueName: boolean;
  kind: KindSubset;
  royaltyInfo: RoyaltyInfoSubset;
  logsEnabled: boolean;
}): Promise<string[]> {
  const { dir, subset, uniqueName, kind, royaltyInfo, logsEnabled } = params;
  await fs.mkdir(dir, { recursive: true });
  const contractNames = [];

  for (const { id, contract, source } of generateSources({ subset, uniqueName, kind, royaltyInfo })) {
    const name = uniqueName ? contract.name : id;
    await fs.writeFile(path.format({ dir, name, ext: '.cairo' }), source);
    contractNames.push(name);
  }
  if (logsEnabled) {
    const sourceLabel = resolveSourceLabel({ kind, royaltyInfo });
    console.log(`Generated ${contractNames.length} contracts for ${sourceLabel}`);
  }

  return contractNames;
}

function resolveSourceLabel(params: { kind: KindSubset; royaltyInfo: RoyaltyInfoSubset }): string {
  const { kind, royaltyInfo } = params;
  switch (kind) {
    case 'ERC721':
    case 'ERC1155':
      return `${kind} (royaltyInfo: ${royaltyInfo})`;
    case 'all':
      return 'All contract kinds';
    case 'ERC20':
    case 'Account':
    case 'Multisig':
    case 'Governor':
    case 'Vesting':
    case 'Custom':
      return kind;
    default: {
      const _: never = kind;
      throw new Error('Unknown kind');
    }
  }
}
