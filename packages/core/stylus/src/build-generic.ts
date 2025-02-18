import { ERC20Options, buildERC20 } from './erc20';
import { ERC1155Options, buildERC1155 } from './erc1155';

export interface KindedOptions {
  ERC20: { kind: 'ERC20' } & ERC20Options;
  ERC1155: { kind: 'ERC1155' } & ERC1155Options;
}

export type GenericOptions = KindedOptions[keyof KindedOptions];

export function buildGeneric(opts: GenericOptions) {
  switch (opts.kind) {
    case 'ERC20':
      return buildERC20(opts);
    case 'ERC1155':
      return buildERC1155(opts);

    default:
      const _: never = opts;
      throw new Error('Unknown ERC');
  }
}
