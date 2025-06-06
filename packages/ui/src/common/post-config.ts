import type { GenericOptions as SolidityOptions } from '@openzeppelin/wizard';
import type { GenericOptions as CairoOptions } from '@openzeppelin/wizard-cairo';
import type { GenericOptions as StellarOptions } from '@openzeppelin/wizard-stellar';
import type { GenericOptions as StylusOptions } from '@openzeppelin/wizard-stylus';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type Action =
  | 'copy'
  | 'remix'
  | 'download-file'
  | 'download-hardhat'
  | 'download-foundry'
  | 'download-scaffold'
  | 'defender';
export type Language = 'solidity' | 'cairo' | 'stylus' | 'stellar';

export async function postConfig(
  opts: Required<SolidityOptions> | Required<CairoOptions> | Required<StellarOptions> | Required<StylusOptions>,
  action: Action,
  language: Language,
) {
  window.gtag?.('event', 'wizard_action', { ...opts, action, wizard_lang: language });
}
