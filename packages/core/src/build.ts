import { ERC20Options, buildERC20 } from './erc20';
import { ERC721Options, buildERC721 } from './erc721';

export type BuildOptions =
  | {
      kind: 'ERC20';
      options: ERC20Options;
    }
  | {
      kind: 'ERC721';
      options: ERC721Options;
    };

export function build(opts: BuildOptions) {
  switch (opts.kind) {
    case 'ERC20':
      return buildERC20(opts.options);

    case 'ERC721':
      return buildERC721(opts.options);
  }

  throw new Error('Unknown ERC');
}
