import { mapValues } from "../utils/map-values";

type Blueprint = Record<string, readonly unknown[]>;

type Alternatives<B extends Blueprint> = {
  [k in keyof B]: B[k][number];
};

export function* generateAlternatives<B extends Blueprint>(
  blueprint: B,
): Generator<Alternatives<B>> {
  const entries = Object.entries(blueprint).map(([key, values]) => ({
    key,
    values,
    current: 0,
    limit: values.length,
  }));

  for (; !done(); advance()) {
    yield Object.fromEntries(
      entries.map(e => [e.key, e.values[e.current % e.limit]]),
    ) as Alternatives<B>;
  }

  function done() {
    const last = entries[entries.length - 1];
    return last?.current === last?.limit;
  }

  function advance() {
    for (const e of entries) {
      e.current = (e.current % e.limit) + 1;
      if (e.current < e.limit) {
        break;
      }
    }
  }
}
