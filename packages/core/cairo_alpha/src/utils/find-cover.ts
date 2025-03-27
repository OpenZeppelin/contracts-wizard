import { sortedBy } from './sorted-by';

// Greedy approximation of minimum set cover.

export function findCover<T extends object>(sets: T[], getElements: (set: T) => unknown[]): T[] {
  const sortedSets = sortedBy(
    sets.map(set => ({ set, elems: getElements(set) })),
    s => -s.elems.length,
  );

  const seen = new Set<unknown>();
  const res = [];

  for (const { set, elems } of sortedSets) {
    let included = false;
    for (const e of elems) {
      if (!included && !seen.has(e)) {
        res.push(set);
        included = true;
      }
      seen.add(e);
    }
  }

  return res;
}
