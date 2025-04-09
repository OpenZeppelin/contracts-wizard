// Solidity
import type { KindedOptions as SolidityKindedOptions } from '../../../../core/solidity/dist';
export type { CommonOptions as SolidityCommonOptions } from '../../../../core/solidity/dist/common-options';
// Stylus
import type { KindedOptions as StylusKindedOptions } from '../../../../core/stylus/dist';
import type { CommonContractOptions as StylusCommonContractOptionsBase } from '../../../../core/stylus/dist/common-options';
export type StylusCommonContractOptions = Omit<StylusCommonContractOptionsBase, 'access'> & { access?: false };

// Add supported language here
export type LanguagesContractsOptions = {
  solidity: Omit<SolidityKindedOptions, 'Stablecoin' | 'RealWorldAsset'> & {
    Stablecoin: Omit<SolidityKindedOptions['Stablecoin'], 'upgradeable'> & { upgradeable?: false };
    RealWorldAsset: Omit<SolidityKindedOptions['RealWorldAsset'], 'upgradeable'> & { upgradeable?: false };
  };
  stylus: Omit<StylusKindedOptions, 'ERC20' | 'ERC721' | 'ERC1155'> & {
    ERC20: StylusKindedOptions['ERC20'] & StylusCommonContractOptions;
    ERC721: StylusKindedOptions['ERC721'] & StylusCommonContractOptions;
    ERC1155: StylusKindedOptions['ERC1155'] & StylusCommonContractOptions;
  };
};

export type AllLanguagesContractsOptions = LanguagesContractsOptions['solidity'] & LanguagesContractsOptions['stylus'];
//

export type SupportedLanguage = keyof LanguagesContractsOptions;

export type LanguageContractsOptions<TLanguage extends SupportedLanguage> = LanguagesContractsOptions[TLanguage];

export type AllLanguageContractsNames = AllLanguagesContractsOptions[keyof AllLanguagesContractsOptions]['kind'];

type ExtractKind<T> = T extends { kind: infer K } ? (K extends string ? K : never) : never;

export type LanguageContractsNames<TLanguage extends SupportedLanguage> = ExtractKind<
  LanguageContractsOptions<TLanguage>[keyof LanguageContractsOptions<TLanguage>]
>;
