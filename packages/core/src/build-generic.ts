import { ERC20Options, buildERC20 } from './erc20';
import { ERC721Options, buildERC721 } from './erc721';

export type GenericOptions =
  | { kind: 'ERC20' } & ERC20Options
  | { kind: 'ERC721' } & ERC721Options;

export function buildGeneric(opts: GenericOptions) {
  switch (opts.kind) {
    case 'ERC20':
      return buildERC20(opts);

    case 'ERC721':
      return buildERC721(opts);
  }

  throw new Error('Unknown ERC');
}
