import type { GenericOptions } from '@openzeppelin/wizard';
import type { GenericOptions as CairoOptions } from '@openzeppelin/wizard-cairo';
import { v4 as uuid } from 'uuid';

declare global {
  interface Window {
    gtag(...args: unknown[]): void;
  }
}
const instance = uuid();

export type Action = 'copy' | 'remix' | 'download-npm' | 'download-vendored' | 'download-hardhat';
export type Language = 'solidity' | 'cairo';

export async function postConfig(opts: Required<GenericOptions> | Required<CairoOptions>, action: Action, language: Language) {
  sendAnalyticsToGTM(opts, action, language);
}
function sendAnalyticsToGTM(opts: any, action: Action, language: Language) {
  var currentObject = opts;
  
  if (typeof window.gtag === 'undefined') {
    return;
  } 
   
  opts.action = action;
  opts.language = language;
  window.gtag("event", "wizard_action", opts);
}
