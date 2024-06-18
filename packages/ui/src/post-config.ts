import type { GenericOptions } from '@openzeppelin/wizard';
import type { GenericOptions as CairoOptions } from '@openzeppelin/wizard-cairo';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type Action = 'copy' | 'remix' | 'download-npm' | 'download-hardhat' | 'download-foundry';
export type Language = 'solidity' | 'cairo';

export async function postConfig(opts: Required<GenericOptions> | Required<CairoOptions>, action: Action, language: Language) {
  window.gtag?.('event', 'wizard_action', { ...opts, action, wizard_lang: language });
}