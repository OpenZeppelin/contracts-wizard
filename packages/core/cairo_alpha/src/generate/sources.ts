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
import type { AccessSubset } from '../set-access-control';

export type Subset = 'all' | 'minimal-cover';

export type KindSubset = 'all' | keyof KindedOptions;

export function* generateOptions(params: {
  kind: KindSubset;
  access: AccessSubset;
  royaltyInfo: RoyaltyInfoSubset;
}): Generator<GenericOptions> {
  const { kind, access, royaltyInfo } = params;
  if (kind === 'all' || kind === 'ERC20') {
    for (const kindOpts of generateERC20Options({ access })) {
      yield { kind: 'ERC20', ...kindOpts };
    }
  }

  if (kind === 'all' || kind === 'ERC721') {
    for (const kindOpts of generateERC721Options({ access, royaltyInfo })) {
      yield { kind: 'ERC721', ...kindOpts };
    }
  }

  if (kind === 'all' || kind === 'ERC1155') {
    for (const kindOpts of generateERC1155Options({ access, royaltyInfo })) {
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
    for (const kindOpts of generateCustomOptions({ access })) {
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
  access: AccessSubset;
  royaltyInfo: RoyaltyInfoSubset;
}): GeneratedContract[] {
  const { subset, kind, access, royaltyInfo } = params;
  const contracts = [];

  for (const options of generateOptions({ kind, access, royaltyInfo })) {
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
  access: AccessSubset;
  royaltyInfo: RoyaltyInfoSubset;
}): Generator<GeneratedSource> {
  const { subset, uniqueName, kind, access, royaltyInfo } = params;
  let counter = 1;
  for (const c of generateContractSubset({ subset, kind, access, royaltyInfo })) {
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
  access: AccessSubset;
  royaltyInfo: RoyaltyInfoSubset;
  logsEnabled: boolean;
}): Promise<string[]> {
  const { dir, subset, uniqueName, kind, access, royaltyInfo, logsEnabled } = params;
  await fs.mkdir(dir, { recursive: true });
  const contractNames = [];

  for (const { id, contract, source } of generateSources({ subset, uniqueName, kind, access, royaltyInfo })) {
    const name = uniqueName ? contract.name : id;
    await fs.writeFile(path.format({ dir, name, ext: '.cairo' }), source);
    contractNames.push(name);
  }
  if (logsEnabled) {
    const sourceLabel = resolveSourceLabel({ kind, access, royaltyInfo });
    console.log(`Generated ${contractNames.length} contracts for ${sourceLabel}`);
  }

  return contractNames;
}

function resolveSourceLabel(params: {
  kind: KindSubset;
  access: AccessSubset;
  royaltyInfo: RoyaltyInfoSubset;
}): string {
  const { kind, access, royaltyInfo } = params;
  return [resolveKindLabel(kind), resolveAccessLabel(kind, access), resolveRoyaltyInfoLabel(kind, royaltyInfo)]
    .filter(elem => elem !== undefined)
    .join(', ');
}

function resolveKindLabel(kind: KindSubset): string {
  switch (kind) {
    case 'all':
      return 'All kinds';
    case 'ERC20':
    case 'ERC721':
    case 'ERC1155':
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

function resolveAccessLabel(kind: KindSubset, access: AccessSubset): string | undefined {
  switch (kind) {
    case 'all':
    case 'Custom':
    case 'ERC20':
    case 'ERC721':
    case 'ERC1155':
      return `access: ${access}`;
    case 'Account':
    case 'Multisig':
    case 'Governor':
    case 'Vesting':
      return undefined;
    default: {
      const _: never = kind;
      throw new Error('Unknown kind');
    }
  }
}

function resolveRoyaltyInfoLabel(kind: KindSubset, royaltyInfo: RoyaltyInfoSubset): string | undefined {
  switch (kind) {
    case 'all':
    case 'ERC721':
    case 'ERC1155':
      return `royalty: ${royaltyInfo}`;
    case 'ERC20':
    case 'Account':
    case 'Custom':
    case 'Multisig':
    case 'Governor':
    case 'Vesting':
      return undefined;
    default: {
      const _: never = kind;
      throw new Error('Unknown kind');
    }
  }
}
