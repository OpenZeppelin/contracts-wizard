import type { Argument } from "./contract";
import type { Access } from "./set-access-control";
import type { Info } from "./set-info";
import { defaults as infoDefaults } from "./set-info";

export const defaults: Required<CommonOptions> = {
  info: infoDefaults,
} as const;

export const contractDefaults: Required<CommonContractOptions> = {
  ...defaults,
  access: false,
} as const;

export interface CommonOptions {
  info?: Info;
}

export interface CommonContractOptions extends CommonOptions {
  access?: Access;
}

export function withCommonDefaults(opts: CommonOptions): Required<CommonOptions> {
  return {
    info: opts.info ?? defaults.info,
  };
}

export function withCommonContractDefaults(opts: CommonContractOptions): Required<CommonContractOptions> {
  return {
    ...withCommonDefaults(opts),
    access: opts.access ?? contractDefaults.access,
  };
}

export function getSelfArg(): Argument {
  return { name: '&mut', type: 'self' };
}