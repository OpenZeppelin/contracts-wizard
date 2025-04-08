import type { KindedOptions as SolidityKindedOptions } from '@openzeppelin/wizard';
export type { CommonOptions as SolidityCommonOptions } from '@openzeppelin/wizard/src/common-options';

// Add supported language here
export type LanguagesContractsOptions = {
  solidity: SolidityKindedOptions;
};

export type AllLanguagesContractsOptions = LanguagesContractsOptions['solidity'];
//

export type SupportedLanguage = keyof LanguagesContractsOptions;

export type LanguageContractsOptions<TLanguage extends SupportedLanguage> = LanguagesContractsOptions[TLanguage];

export type AllLanguageContractsNames = AllLanguagesContractsOptions[keyof AllLanguagesContractsOptions]['kind'];

type ExtractKind<T> = T extends { kind: infer K } ? K : never;

export type LanguageContractsNames<TLanguage extends SupportedLanguage> = ExtractKind<
  LanguageContractsOptions<TLanguage>[keyof LanguageContractsOptions<TLanguage>]
>;
