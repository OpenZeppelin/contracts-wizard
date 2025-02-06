import type { BaseImplementedTrait } from "./contract";

export const externalTrait: BaseImplementedTrait = {
  name: 'ExternalImpl',
  for: 'ExternalTrait',
  tags: [
    '#[contractimpl]',
  ],
  perItemTag: 'external(v0)',
}
