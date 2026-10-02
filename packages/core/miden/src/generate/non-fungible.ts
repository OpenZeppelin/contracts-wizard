import type { NonFungibleOptions } from '../non-fungible';
import { accessOptions, transferPolicyOptions } from '../common-options';
import { nonFungibleBurnPolicyOptions } from '../non-fungible';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  description: ['', 'An NFT collection issued on Miden'],
  logoUri: ['', 'https://example.com/logo.png'],
  contractUri: ['', 'https://example.com/collection.json'],
  updatableMetadata: booleans,
  burnPolicy: nonFungibleBurnPolicyOptions,
  pausable: booleans,
  pausableTransfers: booleans,
  transferPolicy: transferPolicyOptions,
  switchableTransferPolicy: booleans,
  access: accessOptions,
  info: infoOptions,
};

export function* generateNonFungibleOptions(): Generator<Required<NonFungibleOptions>> {
  yield* generateAlternatives(blueprint);
}
