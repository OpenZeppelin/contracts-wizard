import { ERC20Options, buildERC20 } from './erc20';
import { ERC721Options, buildERC721 } from './erc721';
import { ERC1155Options, buildERC1155 } from './erc1155';

export type GenericOptions =
  | { kind: 'ERC20' } & ERC20Options
  | { kind: 'ERC721' } & ERC721Options
  | { kind: 'ERC1155' } & ERC1155Options;

export function buildGeneric(opts: GenericOptions) {
  switch (opts.kind) {
    case 'ERC20':
      return buildERC20(opts);

    case 'ERC721':
      return buildERC721(opts);

    case 'ERC1155':
      return buildERC1155(opts);
  }

  throw new Error('Unknown ERC');
}
