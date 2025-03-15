import type { Component } from '../contract';

type ImplicitNameComponent = Omit<Component, 'name'>;

export function defineComponents<F extends string>(fns: Record<F, ImplicitNameComponent>): Record<F, Component>;

export function defineComponents(modules: Record<string, ImplicitNameComponent>): Record<string, Component> {
  return Object.fromEntries(Object.entries(modules).map(([name, module]) => [name, Object.assign({ name }, module)]));
}
