import type { GenericOptions } from '@openzeppelin/wizard';
import type { GenericOptions as CairoOptions } from '@openzeppelin/wizard-cairo';
import type { GenericOptions as StellarOptions } from '@openzeppelin/wizard-stellar';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type Action = 'copy' | 'remix' | 'download-file' | 'download-hardhat' | 'download-foundry' | 'defender';
export type Language = 'solidity' | 'cairo' | 'stylus' | 'stellar';

export async function postConfig(
    opts: Required<GenericOptions> | Required<CairoOptions> | Required<StellarOptions>,
    action: Action,
    language: Language) {
  window.gtag?.('event', 'wizard_action', { ...opts, action, wizard_lang: language });
}