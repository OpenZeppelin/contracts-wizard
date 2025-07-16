import type { BaseFunction } from '../contract';

type OverridableImplicitNameFunction = Omit<BaseFunction, 'name'> & { name?: string };

export function defineFunctions<F extends string>(
  fns: Record<F, OverridableImplicitNameFunction>,
): Record<F, BaseFunction>;

export function defineFunctions(fns: Record<string, OverridableImplicitNameFunction>): Record<string, BaseFunction> {
  return Object.fromEntries(
    Object.entries(fns).map(([implicitName, fn]) => [
      implicitName,
      Object.assign({ name: fn.name ?? implicitName }, fn),
    ]),
  );
}
