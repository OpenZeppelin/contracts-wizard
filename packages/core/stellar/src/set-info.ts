import type { ContractBuilder } from './contract';
import { OptionsError } from './error';

// Line terminators (and characters that source lexers may treat as such).
// These are disallowed in single-line metadata fields so an embedded line
// break cannot escape the generated SPDX/comment line and inject source.
const LINE_TERMINATOR = /[\n\r\u2028\u2029\u0085\v\f]/u;

function checkSingleLine(value: string, field: string): void {
  if (LINE_TERMINATOR.test(value)) {
    throw new OptionsError({ [field]: 'Must not contain line breaks' });
  }
}

export const infoOptions = [{}, { license: 'WTFPL' }] as const;

export const defaults: Info = { license: 'MIT' };

export type Info = {
  license?: string;
  securityContact?: string;
};

export function setInfo(c: ContractBuilder, { securityContact, license }: Info): void {
  if (securityContact) {
    checkSingleLine(securityContact, 'securityContact');
    c.addContractMetadata({ key: 'security_contact', value: securityContact });
  }

  if (license) {
    checkSingleLine(license, 'license');
    c.license = license;
  }
}
