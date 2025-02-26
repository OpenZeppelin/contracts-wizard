import type { BaseFunction } from '../contract';

type ImplicitNameFunction = Omit<BaseFunction, 'name'>;

export function defineFunctions<F extends string>(fns: Record<F, ImplicitNameFunction>): Record<F, BaseFunction>;

export function defineFunctions(fns: Record<string, ImplicitNameFunction>): Record<string, BaseFunction> {
  return Object.fromEntries(Object.entries(fns).map(([name, fn]) => [name, Object.assign({ name }, fn)]));
}
