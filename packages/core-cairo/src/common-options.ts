import type { FunctionArgument } from "./contract";
import type { Access } from "./set-access-control";
import type { Info } from "./set-info";
import type { Upgradeable } from "./set-upgradeable";

export interface CommonOptions {
  access?: Access;
  upgradeable?: Upgradeable;
  info?: Info;
}

export function withCommonDefaults(opts: CommonOptions): Required<CommonOptions> {
  return {
    access: opts.access ?? 'ownable',
    upgradeable: opts.upgradeable ?? false,
    info: opts.info ?? {},
  };
}

export function withImplicitArgs(): FunctionArgument[] {
  return [ 
    { name: 'syscall_ptr', type: 'felt*' },
    { name: 'pedersen_ptr', type: 'HashBuiltin*' },
    { name: 'range_check_ptr' }
  ];
}