import type { BaseImplementedTrait } from './contract';

export const externalTrait: BaseImplementedTrait = {
  name: 'ExternalImpl',
  of: 'ExternalTrait',
  tags: ['generate_trait', 'abi(per_item)'],
  perItemTag: 'external(v0)',
};
