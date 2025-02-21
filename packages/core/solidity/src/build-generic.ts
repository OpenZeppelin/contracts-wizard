import type { CustomOptions } from './custom';
import { buildCustom } from './custom';
import type { ERC20Options } from './erc20';
import { buildERC20 } from './erc20';
import type { ERC721Options } from './erc721';
import { buildERC721 } from './erc721';
import type { ERC1155Options } from './erc1155';
import { buildERC1155 } from './erc1155';
import type { StablecoinOptions } from './stablecoin';
import { buildStablecoin } from './stablecoin';
import type { GovernorOptions } from './governor';
import { buildGovernor } from './governor';
import type { Contract } from './contract';

export interface KindedOptions {
  ERC20: { kind: 'ERC20' } & ERC20Options;
  ERC721: { kind: 'ERC721' } & ERC721Options;
  ERC1155: { kind: 'ERC1155' } & ERC1155Options;
  Stablecoin: { kind: 'Stablecoin' } & StablecoinOptions;
  RealWorldAsset: { kind: 'RealWorldAsset' } & StablecoinOptions;
  Governor: { kind: 'Governor' } & GovernorOptions;
  Custom: { kind: 'Custom' } & CustomOptions;
}

export type GenericOptions = KindedOptions[keyof KindedOptions];

export function buildGeneric(opts: GenericOptions): Contract {
  switch (opts.kind) {
    case 'ERC20':
      return buildERC20(opts);

    case 'ERC721':
      return buildERC721(opts);

    case 'ERC1155':
      return buildERC1155(opts);

    case 'Stablecoin':
      return buildStablecoin(opts);

    case 'RealWorldAsset':
      return buildStablecoin(opts);

    case 'Governor':
      return buildGovernor(opts);

    case 'Custom':
      return buildCustom(opts);

    default: {
      const _: never = opts;
      throw new Error('Unknown ERC');
    }
  }
}
