import type { Contract } from '@openzeppelin/wizard';
import { buildHooks, type HooksOptions } from './hooks';

export interface KindedOptions {
  Hooks: { kind: 'Hooks' } & HooksOptions;
}

export type GenericOptions = KindedOptions[keyof KindedOptions];

export function buildGeneric(opts: GenericOptions): Contract {
  switch (opts.kind) {
    case 'Hooks':
      return buildHooks(opts);
    default: {
      // TODO: When other contract kinds are available, change the below to:
      // const _: never = opts;
      const _: never = opts.kind;
      throw new Error('Unknown contract kind');
    }
  }
}
