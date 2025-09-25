import type { ContractBuilder } from './contract';

export const infoOptions = [{}, { license: 'WTFPL' }] as const;

export const defaults: Info = { license: 'MIT' };

export type Info = {
  license?: string;
  securityContact?: string;
};

export function setInfo(c: ContractBuilder, { securityContact, license }: Info): void {
  if (securityContact) c.addContractMetadata({ key: 'contact', value: securityContact });

  if (license) c.license = license;
}
