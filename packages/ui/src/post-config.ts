import type { GenericOptions } from '@openzeppelin/wizard';
import type { GenericOptions as CairoOptions } from '@openzeppelin/wizard-cairo';
import { v4 as uuid } from 'uuid';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
const instance = uuid();

export type Action = 'copy' | 'remix' | 'download-npm' | 'download-hardhat' | 'download-foundry';
export type Language = 'solidity' | 'cairo';

export async function postConfig(opts: Required<GenericOptions> | Required<CairoOptions>, action: Action, language: Language) {
  window.gtag?.('event', 'wizard_action', { ...opts, action, wizard_lang: language });
}