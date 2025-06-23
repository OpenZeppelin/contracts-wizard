// Solidity
import type { KindedOptions as SolidityKindedOptions } from '../../../../core/solidity/dist';
export type { CommonOptions as SolidityCommonOptions } from '../../../../core/solidity/dist/common-options';
// Cairo
import type { KindedOptions as CairoKindedOptions } from '../../../../core/cairo/dist';
export type { CommonContractOptions as CairoCommonContractOptions } from '../../../../core/cairo/dist/common-options';
export type { RoyaltyInfoOptions as CairoRoyaltyInfoOptions } from '../../../../core/cairo/dist/set-royalty-info';
// Cairo-alpha
import type { KindedOptions as CairoAlphaKindedOptions } from '../../../../core/cairo_alpha/dist';
export type { CommonContractOptions as CairoAlphaCommonContractOptions } from '../../../../core/cairo_alpha/dist/common-options';
export type { RoyaltyInfoOptions as CairoAlphaRoyaltyInfoOptions } from '../../../../core/cairo_alpha/dist/set-royalty-info';
//Stellar
import type { KindedOptions as StellarKindedOptions } from '../../../../core/stellar/dist';
import type { CommonContractOptions as StellarCommonContractOptionsBase } from '../../../../core/stellar/dist/common-options';
export type StellarCommonContractOptions = Omit<StellarCommonContractOptionsBase, 'upgradeable'> & {
  upgradeable?: false;
};
// Stylus
import type { KindedOptions as StylusKindedOptions } from '../../../../core/stylus/dist';
import type { CommonContractOptions as StylusCommonContractOptionsBase } from '../../../../core/stylus/dist/common-options';
export type StylusCommonContractOptions = Omit<StylusCommonContractOptionsBase, 'access'> & { access?: false };

// Add supported language here
export type LanguagesContractsOptions = {
  solidity: Omit<SolidityKindedOptions, 'Stablecoin' | 'RealWorldAsset' | 'Account' | 'Governor'> & {
    Stablecoin: Omit<SolidityKindedOptions['Stablecoin'], 'upgradeable'> & { upgradeable?: false };
    RealWorldAsset: Omit<SolidityKindedOptions['RealWorldAsset'], 'upgradeable'> & { upgradeable?: false };
    Account: Omit<SolidityKindedOptions['Account'], 'upgradeable' | 'access'> & { upgradeable?: false; access?: false };
    Governor: Omit<SolidityKindedOptions['Governor'], 'access'> & { access?: false };
  };
  cairo: CairoKindedOptions;
  cairoAlpha: CairoAlphaKindedOptions;
  stellar: Omit<StellarKindedOptions, 'Fungible' | 'NonFungible' | 'Stablecoin'> & {
    Fungible: StellarKindedOptions['Fungible'] & StellarCommonContractOptions;
    NonFungible: StellarKindedOptions['NonFungible'] & StellarCommonContractOptions;
    Stablecoin: StellarKindedOptions['Stablecoin'] & StellarCommonContractOptions;
  };
  stylus: Omit<StylusKindedOptions, 'ERC20' | 'ERC721' | 'ERC1155'> & {
    ERC20: StylusKindedOptions['ERC20'] & StylusCommonContractOptions;
    ERC721: StylusKindedOptions['ERC721'] & StylusCommonContractOptions;
    ERC1155: StylusKindedOptions['ERC1155'] & StylusCommonContractOptions;
  };
};

export type AllLanguagesContractsOptions = LanguagesContractsOptions['solidity'] &
  LanguagesContractsOptions['cairo'] &
  LanguagesContractsOptions['cairoAlpha'] &
  LanguagesContractsOptions['stellar'] &
  LanguagesContractsOptions['stylus'];
//

export type SupportedLanguage = keyof LanguagesContractsOptions;

export type LanguageContractsOptions<TLanguage extends SupportedLanguage> = LanguagesContractsOptions[TLanguage];

export type AllLanguageContractsNames = AllLanguagesContractsOptions[keyof AllLanguagesContractsOptions]['kind'];

type ExtractKind<T> = T extends { kind: infer K } ? (K extends string ? K : never) : never;

export type LanguageContractsNames<TLanguage extends SupportedLanguage> = ExtractKind<
  LanguageContractsOptions<TLanguage>[keyof LanguageContractsOptions<TLanguage>]
>;
