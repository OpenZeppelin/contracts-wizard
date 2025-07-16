import type { LanguagesOptions, Language } from './languages-types';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type DownloadAction =
  | 'download-file'
  | 'download-hardhat'
  | 'download-foundry'
  | 'download-scaffold'
  | 'download-rust-stellar';

export type Action = 'copy' | 'remix' | DownloadAction;

export async function postConfig(opts: Partial<LanguagesOptions>, action: Action, language: Language) {
  window.gtag?.('event', 'wizard_action', { ...opts, action, wizard_lang: language });
}
