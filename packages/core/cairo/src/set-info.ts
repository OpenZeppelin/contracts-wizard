import type { ContractBuilder } from './contract';

export const TAG_SECURITY_CONTACT = `Security contact`;

export const infoOptions = [{}, { license: 'WTFPL' }] as const;

export const defaults: Info = { license: 'MIT' };

export type Info = {
  license?: string;
  securityContact?: string;
};

export function setInfo(c: ContractBuilder, info: Info): void {
  const { securityContact, license } = info;

  if (securityContact) {
    c.addDocumentationTag(TAG_SECURITY_CONTACT, securityContact);
  }

  if (license) {
    c.license = license;
  }
}
