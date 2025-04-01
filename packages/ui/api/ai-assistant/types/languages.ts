// Solidity
import type { CommonOptions as SolidityCommonOptions } from '@openzeppelin/wizard/src/common-options';
import type { ERC20Options as SolidityERC20Options } from '@openzeppelin/wizard/src/erc20';
import type { ERC721Options as SolidityERC721Options } from '@openzeppelin/wizard/src/erc721';
import type { ERC1155Options as SolidityERC1155Options } from '@openzeppelin/wizard/src/erc1155';
import type { StablecoinOptions as SolidityStablecoinOptions } from '@openzeppelin/wizard/src/stablecoin';
import type { GovernorOptions as SolidityGovernorOptions } from '@openzeppelin/wizard/src/governor';
import type { CustomOptions as SolidityCustomOptions } from '@openzeppelin/wizard/src/custom';

// Solidity
export interface SolidityKindedOptions {
  ERC20: { kind: 'ERC20' } & SolidityERC20Options;
  ERC721: { kind: 'ERC721' } & SolidityERC20Options & SolidityCommonOptions & SolidityERC721Options;
  ERC1155: { kind: 'ERC1155' } & SolidityERC1155Options;
  Stablecoin: { kind: 'Stablecoin' } & SolidityERC20Options & SolidityStablecoinOptions;
  RealWorldAsset: { kind: 'RealWorldAsset' } & SolidityERC20Options & SolidityStablecoinOptions;
  Governor: { kind: 'Governor' } & SolidityGovernorOptions;
  Custom: { kind: 'Custom' } & SolidityCustomOptions;
}

export type {
  SolidityCommonOptions,
  SolidityCustomOptions,
  SolidityERC20Options,
  SolidityERC721Options,
  SolidityERC1155Options,
  SolidityStablecoinOptions,
  SolidityGovernorOptions,
};

export type SupportedLanguage = 'solidity';

export type AllLanguageContractOptions = {
  [k in keyof SolidityKindedOptions]: Required<SolidityCommonOptions> & SolidityKindedOptions[k];
};

export type AllLanguageFunctionName = SolidityKindedOptions[keyof SolidityKindedOptions]['kind'];
