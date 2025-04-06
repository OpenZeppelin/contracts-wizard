import type { IsObject, UnknownIfHasAnAnyAttribute } from './helpers.ts';
import type { SolidityKindedOptions } from './solidity.ts';

export type LanguagesContractsOptions = IsObject<
  UnknownIfHasAnAnyAttribute<{
    solidity: SolidityKindedOptions;
  }>
>;

export type AllLanguagesContractsOptions = LanguagesContractsOptions['solidity'];

export type SupportedLanguage = keyof LanguagesContractsOptions;

export type LanguageContractsOptions<TLanguage extends SupportedLanguage> = LanguagesContractsOptions[TLanguage];

export type AllLanguageContractsNames = AllLanguagesContractsOptions[keyof AllLanguagesContractsOptions]['kind'];

type ExtractKind<T> = T extends { kind: infer K } ? K : never;

export type LanguageContractsNames<TLanguage extends SupportedLanguage> = ExtractKind<
  LanguageContractsOptions<TLanguage>[keyof LanguageContractsOptions<TLanguage>]
>;
