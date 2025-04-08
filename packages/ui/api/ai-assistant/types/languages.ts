import type { KindedOptions as SolidityKindedOptions } from '../../../../core/solidity/dist';
export type { CommonOptions as SolidityCommonOptions } from '../../../../core/solidity/dist/common-options';
// Stylus
import type { KindedOptions as StylusKindedOptions } from '../../../../core/stylus/dist';
export type { CommonContractOptions as StylusCommonContractOptions } from '../../../../core/stylus/dist/common-options';

// Add supported language here
export type LanguagesContractsOptions = {
  solidity: Omit<SolidityKindedOptions, 'Stablecoin' | 'RealWorldAsset'> & {
    Stablecoin: Omit<SolidityKindedOptions['Stablecoin'], 'upgradeable'> & { upgradeable?: false };
    RealWorldAsset: Omit<SolidityKindedOptions['RealWorldAsset'], 'upgradeable'> & { upgradeable?: false };
  };
  stylus: StylusKindedOptions;
};

export type AllLanguagesContractsOptions = LanguagesContractsOptions['solidity'] & LanguagesContractsOptions['stylus'];
//

export type SupportedLanguage = keyof LanguagesContractsOptions;

export type LanguageContractsOptions<TLanguage extends SupportedLanguage> = LanguagesContractsOptions[TLanguage];

export type AllLanguageContractsNames = AllLanguagesContractsOptions[keyof AllLanguagesContractsOptions]['kind'];

type ExtractKind<T> = T extends { kind: infer K } ? K : never;

export type LanguageContractsNames<TLanguage extends SupportedLanguage> = ExtractKind<
  LanguageContractsOptions<TLanguage>[keyof LanguageContractsOptions<TLanguage>]
>;
