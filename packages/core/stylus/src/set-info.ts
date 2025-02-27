import type { ContractBuilder } from './contract';

export const infoOptions = [{}, { license: 'WTFPL' }] as const;

export const defaults: Info = { license: 'MIT' };

export type Info = {
  license?: string;
};

export function setInfo(c: ContractBuilder, info: Info): void {
  const { license } = info;

  if (license) {
    c.license = license;
  }
}
