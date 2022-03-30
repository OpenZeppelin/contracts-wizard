import { ERC20Options, buildERC20 } from './erc20';
import { ERC721Options, buildERC721 } from './erc721';

export interface KindedOptions {
  ERC20:    { kind: 'ERC20' }    & ERC20Options;
  ERC721:   { kind: 'ERC721' }   & ERC721Options;
}

export type GenericOptions = KindedOptions[keyof KindedOptions];

export function buildGeneric(opts: GenericOptions) {
  switch (opts.kind) {
    case 'ERC20':
      return buildERC20(opts);

    case 'ERC721':
      return buildERC721(opts);

    default:
      const _: never = opts;
      throw new Error('Unknown ERC');
  }
}
