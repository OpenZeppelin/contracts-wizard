import type { Module } from '../contract';

type ImplicitNameModule = Omit<Module, 'name'>;

export function defineModules<F extends string>(
  fns: Record<F, ImplicitNameModule>,
): Record<F, Module>;

export function defineModules(
  modules: Record<string, ImplicitNameModule>,
): Record<string, Module> {
  return Object.fromEntries(
    Object.entries(modules).map(([name, module]) => [
      name,
      Object.assign({ name }, module),
    ]),
  );
}
