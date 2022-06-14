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
    access: opts.access ?? false,
    upgradeable: opts.upgradeable ?? false,
    info: opts.info ?? {},
  };
}
