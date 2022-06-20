import type { Argument } from "./contract";
import type { Access } from "./set-access-control";
import type { Info } from "./set-info";
import { defaults as infoDefaults } from "./set-info";
import type { Upgradeable } from "./set-upgradeable";

export const defaults: Required<CommonOptions> = {
  access: false,
  upgradeable: false,
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

export function withImplicitArgs(): Argument[] {
  return [ 
    { name: 'syscall_ptr', type: 'felt*' },
    { name: 'pedersen_ptr', type: 'HashBuiltin*' },
    { name: 'range_check_ptr' }
  ];
}