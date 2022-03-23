import type { ContractBuilder } from "./contract";

export const TAG_SECURITY_CONTACT = `@custom:security-contact`;

export const infoOptions = [{}, { securityContact: 'security@example.com', license: 'WTFPL' }] as const;

export const defaults: Info = { license: 'MIT' };

export type Info = {
  securityContact?: string;
  license?: string;
}

export function setInfo(c: ContractBuilder, info: Info) {
  const { securityContact, license } = info;
  
  if (securityContact) {
    c.addNatspecTag(TAG_SECURITY_CONTACT, securityContact);
  }

  if (license) {
    c.license = license;
  }
}
