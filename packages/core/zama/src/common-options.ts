import type { Info } from '@openzeppelin/wizard/src/set-info';
import { defaults as infoDefaults } from '@openzeppelin/wizard/src/set-info';

export const defaults: Required<CommonOptions> = {
  info: infoDefaults,
} as const;

export interface CommonOptions {
  info?: Info;
}

export function withCommonDefaults(opts: CommonOptions): Required<CommonOptions> {
  return {
    info: opts.info ?? {},
  };
}
