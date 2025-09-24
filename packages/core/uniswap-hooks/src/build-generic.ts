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
  }
}
