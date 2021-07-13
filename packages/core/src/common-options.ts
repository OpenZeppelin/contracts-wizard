import type { Access } from "./set-access-control";
import type { Upgradeable } from "./set-upgradeable";

export interface CommonOptions {
  access?: Access;
  upgradeable?: Upgradeable;
}

export function withCommonDefaults(opts: CommonOptions): Required<CommonOptions> {
  return {
    access: opts.access ?? 'ownable',
    upgradeable: opts.upgradeable ?? false,
  };
}
