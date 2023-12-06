import type { BaseImplementedTrait } from "./contract";

export const externalTrait: BaseImplementedTrait = {
  name: 'ExternalImpl',
  of: 'ExternalTrait',
  tags: [
    '#[generate_trait]',
    '#[external(v0)]'
  ],
}
