type T = string;

export function transitiveClosure(obj: Record<T, Iterable<T>>): Record<T, Set<T>> {
  const closure = {} as Record<T, Set<T>>;

  for (const key in obj) {
    closure[key] = reachable(obj, key);
  }

  return closure;
}

export function reachable(obj: Record<T, Iterable<T>>, key: T): Set<T> {
  let prevSize = 0;
  const res = new Set(obj[key]);

  while (prevSize < res.size) {
    prevSize = res.size;
    for (const k of res) {
      for (const v of obj[k] ?? []) {
        res.add(v);
      }
    }
  }

  return res;
}
