import type { Info } from '@openzeppelin/wizard';
import { infoDefaults } from '@openzeppelin/wizard';

export const defaults: Required<CommonOptions> = {
  info: infoDefaults,
} as const;

export interface CommonOptions {
  info?: Info;
}

export function withCommonDefaults(opts: CommonOptions): Required<CommonOptions> {
  return {
    info: { ...defaults.info, ...(opts.info ?? {}) },
  };
}
