import type { FungibleOptions } from '../fungible';
import { accessOptions, transferPolicyOptions } from '../common-options';
import { fungibleBurnPolicyOptions } from '../fungible';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  decimals: ['8'],
  maxSupply: ['1000000000'],
  description: ['', 'A token issued on Miden'],
  logoUri: ['', 'https://example.com/logo.png'],
  externalLink: ['', 'https://example.com'],
  updatableMetadata: booleans,
  updatableMaxSupply: booleans,
  burnPolicy: fungibleBurnPolicyOptions,
  minBurnAmount: ['', '10'],
  pausable: booleans,
  pausableTransfers: booleans,
  transferPolicy: transferPolicyOptions,
  switchableTransferPolicy: booleans,
  access: accessOptions,
  info: infoOptions,
};

export function* generateFungibleOptions(): Generator<Required<FungibleOptions>> {
  yield* generateAlternatives(blueprint);
}
