import type { Access } from "./set-access-control";

export interface CommonOptions {
  access?: Access;
}

export function withCommonDefaults(opts: CommonOptions): Required<CommonOptions> {
  return {
    access: opts.access ?? 'ownable',
  };
}
