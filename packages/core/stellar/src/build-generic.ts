import { ERC20Options, buildERC20 } from './erc20';

export interface KindedOptions {
  ERC20:    { kind: 'ERC20' }    & ERC20Options;
}

export type GenericOptions = KindedOptions[keyof KindedOptions];

export function buildGeneric(opts: GenericOptions) {
  switch (opts.kind) {
    case 'ERC20':
      return buildERC20(opts);

    default:
      const _: never = opts.kind; // TODO: When there are additional kinds above, change this assignment to just `opts` instead of `opts.kind`
      throw new Error('Unknown ERC');
  }
}
