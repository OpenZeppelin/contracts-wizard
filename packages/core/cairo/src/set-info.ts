import type { ContractBuilder } from './contract';

export const SECURITY_CONTACT_DOCUMENTATION = `Security contact: `;

export const infoOptions = [{}, { license: 'WTFPL' }] as const;

export const defaults: Info = { license: 'MIT' };

export type Info = {
  license?: string;
  securityContact?: string;
};

export function setInfo(c: ContractBuilder, info: Info): void {
  const { securityContact, license } = info;

  if (securityContact) {
    c.addDocumentation(`${SECURITY_CONTACT_DOCUMENTATION}${securityContact}`);
  }

  if (license) {
    c.license = license;
  }
}
