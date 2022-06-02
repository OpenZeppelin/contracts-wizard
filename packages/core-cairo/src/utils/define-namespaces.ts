import type { Namespace } from '../contract';

type ImplicitNameNamespace = Omit<Namespace, 'name'>;

export function defineNamespaces<F extends string>(
  fns: Record<F, ImplicitNameNamespace>,
): Record<F, Namespace>;

export function defineNamespaces(
  namespaces: Record<string, ImplicitNameNamespace>,
): Record<string, Namespace> {
  return Object.fromEntries(
    Object.entries(namespaces).map(([name, namespace]) => [
      name,
      Object.assign({ name }, namespace),
    ]),
  );
}
