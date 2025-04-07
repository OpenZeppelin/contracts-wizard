import type { IsObject, UnknownIfHasAnAnyAttribute } from './helpers.ts';
import type { SolidityKindedOptions } from './solidity.ts';
import type { StellarKindedOptions } from './stellar.ts';

export type LanguagesContractsOptions = IsObject<
  UnknownIfHasAnAnyAttribute<{
    solidity: SolidityKindedOptions;
    stellar: StellarKindedOptions;
  }>
>;

export type AllLanguagesContractsOptions = LanguagesContractsOptions['solidity'] & LanguagesContractsOptions['stellar'];

export type SupportedLanguage = keyof LanguagesContractsOptions;

export type LanguageContractsOptions<TLanguage extends SupportedLanguage> = LanguagesContractsOptions[TLanguage];

export type AllLanguageContractsNames = AllLanguagesContractsOptions[keyof AllLanguagesContractsOptions]['kind'];

type ExtractKind<T> = T extends { kind: infer K } ? K : never;

export type LanguageContractsNames<TLanguage extends SupportedLanguage> = ExtractKind<
  LanguageContractsOptions<TLanguage>[keyof LanguageContractsOptions<TLanguage>]
>;
