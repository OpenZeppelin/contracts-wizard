import type { IsObject, UnknownIfHasAnAnyAttribute } from './helpers.ts';
// Solidity
import type {
  ERC20Options as SolidityERC20Options,
  CrossChainBridging as SolidityCrossChainBridging,
} from '@openzeppelin/wizard/src/erc20';
import type { ERC721Options as SolidityERC721Options } from '@openzeppelin/wizard/src/erc721';
import type { ERC1155Options as SolidityERC1155Options } from '@openzeppelin/wizard/src/erc1155';
import type { StablecoinOptions as SolidityStablecoinOptions } from '@openzeppelin/wizard/src/stablecoin';
import type { GovernorOptions as SolidityGovernorOptions } from '@openzeppelin/wizard/src/governor';
import type { CustomOptions as SolidityCustomOptions } from '@openzeppelin/wizard/src/custom';
import type { Access as SolidityAccess } from '@openzeppelin/wizard/src/set-access-control';
import type { Upgradeable as SolidityUpgradeable } from '@openzeppelin/wizard/src/set-upgradeable';
import type { Info as SolidityInfo } from '@openzeppelin/wizard/src/set-info';
import type { ClockMode as SolidityClockMode } from '@openzeppelin/wizard/src/set-clock-mode';

export interface SolidityCommonOptions {
  access?: SolidityAccess;
  upgradeable?: SolidityUpgradeable;
  info?: SolidityInfo;
}

type SolidityRetypedOptions = {
  votes?: false | SolidityClockMode;
  crossChainBridging?: SolidityCrossChainBridging;
  clockMode?: SolidityClockMode;
};

type WithSolidityRetypedOption<T, TKeys extends keyof T & keyof SolidityRetypedOptions> = Omit<T, TKeys> &
  Pick<SolidityRetypedOptions, TKeys>;

export interface SolidityKindedOptions {
  ERC20: { kind: 'ERC20' } & IsObject<
    UnknownIfHasAnAnyAttribute<
      SolidityCommonOptions & WithSolidityRetypedOption<SolidityERC20Options, 'votes' | 'crossChainBridging'>
    >
  >;
  ERC721: { kind: 'ERC721' } & IsObject<
    UnknownIfHasAnAnyAttribute<SolidityCommonOptions & WithSolidityRetypedOption<SolidityERC721Options, 'votes'>>
  >;
  ERC1155: { kind: 'ERC1155' } & IsObject<UnknownIfHasAnAnyAttribute<SolidityCommonOptions & SolidityERC1155Options>>;
  Stablecoin: { kind: 'Stablecoin' } & IsObject<
    UnknownIfHasAnAnyAttribute<
      SolidityCommonOptions &
        WithSolidityRetypedOption<SolidityERC20Options, 'votes' | 'crossChainBridging'> &
        SolidityStablecoinOptions
    >
  >;
  RealWorldAsset: { kind: 'RealWorldAsset' } & IsObject<
    UnknownIfHasAnAnyAttribute<
      SolidityCommonOptions &
        WithSolidityRetypedOption<SolidityERC20Options, 'votes' | 'crossChainBridging'> &
        SolidityStablecoinOptions
    >
  >;
  Governor: { kind: 'Governor' } & IsObject<
    UnknownIfHasAnAnyAttribute<SolidityCommonOptions & WithSolidityRetypedOption<SolidityGovernorOptions, 'clockMode'>>
  >;
  Custom: { kind: 'Custom' } & IsObject<UnknownIfHasAnAnyAttribute<SolidityCommonOptions & SolidityCustomOptions>>;
}

export type LanguagesContractsOptions = IsObject<
  UnknownIfHasAnAnyAttribute<{
    solidity: SolidityKindedOptions;
  }>
>;

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
