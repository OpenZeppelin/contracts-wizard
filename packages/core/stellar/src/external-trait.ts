import type { BaseImplementedTrait } from "./contract";

export const externalTrait: BaseImplementedTrait = {
  name: 'ExternalImpl',
  of: 'ExternalTrait',
  tags: [
    '#[contractimpl]',
  ],
  perItemTag: 'external(v0)',
}
