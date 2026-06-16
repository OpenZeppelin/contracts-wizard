import type { ContractBuilder } from './contract';
import { OptionsError } from './error';

export const SECURITY_CONTACT_DOCUMENTATION = `Security contact: `;

// These values are printed into a // comment line in the generated Cairo. LF
// ends that comment, letting following text become source. CR and U+2028/U+2029
// are rejected as defense in depth (review tools render U+2028/U+2029 as line
// breaks).
const LINE_TERMINATOR = /[\n\r\u2028\u2029]/u;

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

export function setInfo(c: ContractBuilder, info: Info): void {
  const { securityContact, license } = info;

  if (securityContact) {
    checkSingleLine(securityContact, 'securityContact');
    c.addDocumentation(`${SECURITY_CONTACT_DOCUMENTATION}${securityContact}`);
  }

  if (license) {
    checkSingleLine(license, 'license');
    c.license = license;
  }
}
