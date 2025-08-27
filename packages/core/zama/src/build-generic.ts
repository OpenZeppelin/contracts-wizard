import type { ERC20Options } from './erc20';
import { buildERC20 } from './erc20';
import type { Contract } from './contract';

export interface KindedOptions {
  ERC20: { kind: 'ERC20' } & ERC20Options;
}

export type GenericOptions = KindedOptions[keyof KindedOptions];

export function buildGeneric(opts: GenericOptions): Contract {
  switch (opts.kind) {
    case 'ERC20':
      return buildERC20(opts);

    default: {
      // TODO: When other contract kinds are available, change the below to:
      // const _: never = opts;
      const _: never = opts.kind;
      throw new Error('Unknown contract kind');
    }
  }
}
