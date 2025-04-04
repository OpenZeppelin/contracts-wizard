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
  Governor: { kind: 'Governor' } & SolidityCommonOptions & SolidityGovernorOptions;
  Custom: { kind: 'Custom' } & SolidityCommonOptions & SolidityCustomOptions;
}

// Cairo
import type { ERC20Options as CairoERC20Options } from '@openzeppelin/wizard-cairo/src/erc20';
import type { ERC721Options as CairoERC721Options } from '@openzeppelin/wizard-cairo/src/erc721';
import type { ERC1155Options as CairoERC1155Options } from '@openzeppelin/wizard-cairo/src/erc1155';
import type { AccountOptions as CairoAccountOptions } from '@openzeppelin/wizard-cairo/src/account';
import type { MultisigOptions as CairoMultisigOptions } from '@openzeppelin/wizard-cairo/src/multisig';
import type { GovernorOptions as CairoGovernorOptions } from '@openzeppelin/wizard-cairo/src/governor';
import type { VestingOptions as CairoVestingOptions } from '@openzeppelin/wizard-cairo/src/vesting';
import type { CustomOptions as CairoCustomOptions } from '@openzeppelin/wizard-cairo/src/custom';
import type { Access as CairoAccesss } from '@openzeppelin/wizard-cairo/src/set-access-control';
import type { Upgradeable as CairoUpgradeable } from '@openzeppelin/wizard-cairo/src/set-upgradeable';
import type { Info as CairoInfo } from '@openzeppelin/wizard-cairo/src/set-info';

export interface CairoCommonOptions {
  access?: CairoAccesss;
  upgradeable?: CairoUpgradeable;
  info?: CairoInfo;
}

export interface CairoKindedOptions {
  ERC20: { kind: 'ERC20' } & CairoCommonOptions & CairoERC20Options;
  ERC721: { kind: 'ERC721' } & CairoCommonOptions & CairoERC721Options;
  ERC1155: { kind: 'ERC1155' } & CairoCommonOptions & CairoERC1155Options;
  Account: { kind: 'Account' } & CairoCommonOptions & CairoAccountOptions;
  Multisig: { kind: 'Multisig' } & CairoCommonOptions & CairoMultisigOptions;
  Governor: { kind: 'Governor' } & CairoCommonOptions & CairoGovernorOptions;
  Vesting: { kind: 'Vesting' } & CairoCommonOptions & CairoVestingOptions;
  Custom: { kind: 'Custom' } & CairoCommonOptions & CairoCustomOptions;
}

// After importing and building KindedOptions add supported language here
export type LanguagesContractsOptions = {
  solidity: SolidityKindedOptions;
  cairo: CairoKindedOptions;
};

export type AllLanguagesContractsOptions = LanguagesContractsOptions['solidity'] & LanguagesContractsOptions['cairo'];
//

export type SupportedLanguage = keyof LanguagesContractsOptions;

// Utils
export type LanguageContractsOptions<TLanguage extends SupportedLanguage> = LanguagesContractsOptions[TLanguage];

export type AllLanguageContractsNames = AllLanguagesContractsOptions[keyof AllLanguagesContractsOptions]['kind'];

type ExtractKind<T> = T extends { kind: infer K } ? K : never;

export type LanguageContractsNames<TLanguage extends SupportedLanguage> = ExtractKind<
  LanguageContractsOptions<TLanguage>[keyof LanguageContractsOptions<TLanguage>]
>;
