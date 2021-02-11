import 'array.prototype.flatmap/auto';

export function intersperse<E, D>(arr: E[], delim: D): (E | D)[] {
  return arr.flatMap(e => [delim, e]).slice(1);
}
