import type { LanguagesOptions, Language } from './languages-types';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type ZipAction =
  | 'download-file'
  | 'download-hardhat'
  | 'download-foundry'
  | 'download-scaffold'
  | 'download-rust-stellar';

export type Action = 'copy' | 'remix' | ZipAction | 'defender';

export async function postConfig(opts: Partial<LanguagesOptions>, action: Action, language: Language) {
  window.gtag?.('event', 'wizard_action', { ...opts, action, wizard_lang: language });
}
