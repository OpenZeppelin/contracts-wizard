import type { ContractBuilder } from './contract';
import { OptionsError } from './error';

export const TAG_SECURITY_CONTACT = `@custom:security-contact`;

// LF and CR end a line comment in solc, letting following text escape the
// generated comment line and become source. U+2028/U+2029 are also rejected:
// solc errors on them, and review tools render them as line breaks. Other
// control chars (VT/FF/NEL) error in solc too but cannot silently inject.
const LINE_TERMINATOR = /[\n\r\u2028\u2029]/u;

function checkSingleLine(value: string, field: string): void {
  if (LINE_TERMINATOR.test(value)) {
    throw new OptionsError({ [field]: 'Must not contain line breaks' });
  }
}

export const infoOptions = [{}, { securityContact: 'security@example.com', license: 'WTFPL' }] as const;

export const defaults: Info = { license: 'MIT' };

export type Info = {
  securityContact?: string;
  license?: string;
};

export function setInfo(c: ContractBuilder, info: Info) {
  const { securityContact, license } = info;

  if (securityContact) {
    checkSingleLine(securityContact, 'securityContact');
    c.addNatspecTag(TAG_SECURITY_CONTACT, securityContact);
  }

  if (license) {
    checkSingleLine(license, 'license');
    c.license = license;
  }
}
