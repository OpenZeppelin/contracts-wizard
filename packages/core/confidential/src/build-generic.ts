import type { ERC7984Options } from './erc7984';
import { buildERC7984 } from './erc7984';
import type { Contract } from '@openzeppelin/wizard';

export interface KindedOptions {
  ERC7984: { kind: 'ERC7984' } & ERC7984Options;
}

export type GenericOptions = KindedOptions[keyof KindedOptions];

export function buildGeneric(opts: GenericOptions): Contract {
  switch (opts.kind) {
    case 'ERC7984':
      return buildERC7984(opts);

    default: {
      // TODO: When other contract kinds are available, change the below to:
      // const _: never = opts;
      const _: never = opts.kind;
      throw new Error('Unknown contract kind');
    }
  }
}
