// Solidity
import type { ERC20Options as SolidityERC20Options } from '@openzeppelin/wizard/src/erc20';
import type { ERC721Options as SolidityERC721Options } from '@openzeppelin/wizard/src/erc721';
import type { ERC1155Options as SolidityERC1155Options } from '@openzeppelin/wizard/src/erc1155';
import type { StablecoinOptions as SolidityStablecoinOptions } from '@openzeppelin/wizard/src/stablecoin';
import type { GovernorOptions as SolidityGovernorOptions } from '@openzeppelin/wizard/src/governor';
import type { CustomOptions as SolidityCustomOptions } from '@openzeppelin/wizard/src/custom';
import type { Access as SolidityAccesss } from '@openzeppelin/wizard/src/set-access-control';
import type { Upgradeable as SolidityUpgradeable } from '@openzeppelin/wizard/src/set-upgradeable';
import type { Info as SolidityInfo } from '@openzeppelin/wizard/src/set-info';

// Solidity

interface SolidityCommonOptions {
  access?: SolidityAccesss;
  upgradeable?: SolidityUpgradeable;
  info?: SolidityInfo;
}

export interface SolidityKindedOptions {
  ERC20: { kind: 'ERC20' } & SolidityCommonOptions & SolidityERC20Options;
  ERC721: { kind: 'ERC721' } & SolidityCommonOptions & SolidityERC721Options;
  ERC1155: { kind: 'ERC1155' } & SolidityCommonOptions & SolidityERC1155Options;
  Stablecoin: { kind: 'Stablecoin' } & SolidityCommonOptions & SolidityERC20Options & SolidityStablecoinOptions;
  RealWorldAsset: { kind: 'RealWorldAsset' } & SolidityCommonOptions & SolidityERC20Options & SolidityStablecoinOptions;
  Governor: { kind: 'Governor' } & SolidityCommonOptions & SolidityGovernorOptions;
  Custom: { kind: 'Custom' } & SolidityCommonOptions & SolidityCustomOptions;
}

export type { SolidityCommonOptions };

export type SupportedLanguage = 'solidity';

export type AllLanguageContractOptions = {
  [k in keyof SolidityKindedOptions]: SolidityKindedOptions[k];
};

export type AllLanguageFunctionName = SolidityKindedOptions[keyof SolidityKindedOptions]['kind'];
