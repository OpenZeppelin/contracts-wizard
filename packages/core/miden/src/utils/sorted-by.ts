export function sortedBy<T>(xs: Iterable<T>, fn: (x: T) => number): T[] {
  return Array.from(xs).sort((a, b) => fn(a) - fn(b));
}
