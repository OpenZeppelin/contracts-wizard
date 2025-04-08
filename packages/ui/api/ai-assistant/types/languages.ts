// Solidity
import type { ERC20Options as SolidityERC20Options } from '@openzeppelin/wizard/src/erc20';
import type { ERC721Options as SolidityERC721Options } from '@openzeppelin/wizard/src/erc721';
import type { ERC1155Options as SolidityERC1155Options } from '@openzeppelin/wizard/src/erc1155';
import type { StablecoinOptions as SolidityStablecoinOptions } from '@openzeppelin/wizard/src/stablecoin';
import type { AccountOptions as SolidityAccountOptions } from '@openzeppelin/wizard/src/account';
import type { PaymasterOptions as SolidityPaymasterOptions } from '@openzeppelin/wizard/src/paymaster';
import type { GovernorOptions as SolidityGovernorOptions } from '@openzeppelin/wizard/src/governor';
import type { CustomOptions as SolidityCustomOptions } from '@openzeppelin/wizard/src/custom';
import type { Access as SolidityAccesss } from '@openzeppelin/wizard/src/set-access-control';
import type { Upgradeable as SolidityUpgradeable } from '@openzeppelin/wizard/src/set-upgradeable';
import type { Info as SolidityInfo } from '@openzeppelin/wizard/src/set-info';
import type { AccountOptions } from '@openzeppelin/wizard-cairo/src/account';

// Solidity

export interface SolidityCommonOptions {
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
  Account: { kind: 'Account' } & SolidityCommonOptions & SolidityERC20Options & SolidityAccountOptions;
  Paymaster: { kind: 'Paymaster' } & SolidityCommonOptions & SolidityERC20Options & SolidityPaymasterOptions;
  Governor: { kind: 'Governor' } & SolidityCommonOptions & SolidityGovernorOptions;
  Custom: { kind: 'Custom' } & SolidityCommonOptions & SolidityCustomOptions;
}

// After importing and building KindedOptions add supported language here
export type LanguagesContractsOptions = {
  solidity: SolidityKindedOptions;
};

export type AllLanguagesContractsOptions = LanguagesContractsOptions['solidity'];

//

export type SupportedLanguage = keyof LanguagesContractsOptions;

// Utils
export type LanguageContractsOptions<TLanguage extends SupportedLanguage> = LanguagesContractsOptions[TLanguage];

export type AllLanguageContractsNames = AllLanguagesContractsOptions[keyof AllLanguagesContractsOptions]['kind'];

type ExtractKind<T> = T extends { kind: infer K } ? K : never;

export type LanguageContractsNames<TLanguage extends SupportedLanguage> = ExtractKind<
  LanguageContractsOptions<TLanguage>[keyof LanguageContractsOptions<TLanguage>]
>;
