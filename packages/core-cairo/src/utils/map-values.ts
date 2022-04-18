export function mapValues<K extends keyof any, V, W>(
  obj: Record<K, V>,
  fn: (val: V) => W,
): Record<K, W> {
  const res = {} as Record<K, W>;
  for (const key in obj) {
    res[key] = fn(obj[key]);
  }
  return res;
}
