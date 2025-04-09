import type { KindedOptions as SolidityKindedOptions } from '../../../../core/solidity/dist';
export type { CommonOptions as SolidityCommonOptions } from '../../../../core/solidity/dist/common-options';
import type { KindedOptions as StellarKindedOptions } from '../../../../core/stellar/dist';
import type { CommonContractOptions as StellarCommonContractOptionsBase } from '../../../../core/stellar/dist/common-options';
export type StellarCommonContractOptions = Omit<StellarCommonContractOptionsBase, 'access'> & { access?: false };

// Add supported language here
export type LanguagesContractsOptions = {
  solidity: Omit<SolidityKindedOptions, 'Stablecoin' | 'RealWorldAsset'> & {
    Stablecoin: Omit<SolidityKindedOptions['Stablecoin'], 'upgradeable'> & { upgradeable?: false };
    RealWorldAsset: Omit<SolidityKindedOptions['RealWorldAsset'], 'upgradeable'> & { upgradeable?: false };
  };
  stellar: Omit<StellarKindedOptions, 'Fungible'> & {
    Fungible: StellarKindedOptions['Fungible'] & StellarCommonContractOptions;
  };
};

export type AllLanguagesContractsOptions = LanguagesContractsOptions['solidity'];
//

export type SupportedLanguage = keyof LanguagesContractsOptions;

export type LanguageContractsOptions<TLanguage extends SupportedLanguage> = LanguagesContractsOptions[TLanguage];

export type AllLanguageContractsNames = AllLanguagesContractsOptions[keyof AllLanguagesContractsOptions]['kind'];

type ExtractKind<T> = T extends { kind: infer K } ? (K extends string ? K : never) : never;

export type LanguageContractsNames<TLanguage extends SupportedLanguage> = ExtractKind<
  LanguageContractsOptions<TLanguage>[keyof LanguageContractsOptions<TLanguage>]
>;
