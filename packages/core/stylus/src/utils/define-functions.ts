import type { BaseFunction } from '../contract';

export function defineFunctions<F extends string>(fns: Record<F, BaseFunction>): Record<F, BaseFunction>;

export function defineFunctions(fns: Record<string, BaseFunction>): Record<string, BaseFunction> {
  return Object.fromEntries(Object.entries(fns).map(([name, fn]) => [name, Object.assign({ name }, fn)]));
}
