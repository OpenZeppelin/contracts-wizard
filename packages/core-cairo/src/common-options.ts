import type { Argument } from "./contract";
import type { Access } from "./set-access-control";
import type { Info } from "./set-info";
import { defaults as infoDefaults } from "./set-info";
import type { Upgradeable } from "./set-upgradeable";

export const defaults: Required<CommonOptions> = {
  access: false,
  upgradeable: true,
  info: infoDefaults,
} as const;

export interface CommonOptions {
  access?: Access;
  upgradeable?: Upgradeable;
  info?: Info;
}

export function withCommonDefaults(opts: CommonOptions): Required<CommonOptions> {
  return {
    access: opts.access ?? defaults.access,
    upgradeable: opts.upgradeable ?? defaults.upgradeable,
    info: opts.info ?? defaults.info,
  };
}

export function getSelfArg(scope: 'external' | 'view' = 'external'): Argument {
  if (scope === 'view') {
    return { name: 'self', type: '@ContractState' };
  } else {
    return { name: 'ref self', type: 'ContractState' };
  }
}