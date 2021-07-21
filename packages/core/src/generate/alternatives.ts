import { mapValues } from "../utils/map-values";

type Blueprint = Record<string, readonly unknown[]>;

type Alternatives<B extends Blueprint> = {
  [k in keyof B]: B[k][number];
};

export function* generateAlternatives<B extends Blueprint>(
  blueprint: B,
  forceTrue = false,
): Generator<Alternatives<B>> {
  const realBlueprint = withForcedTrue(blueprint, forceTrue);

  const entries = Object.entries(realBlueprint).map(([key, values]) => ({
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

function withForcedTrue(blueprint: Blueprint, forceTrue: boolean): Blueprint {
  return mapValues(blueprint, values => {
    if (!forceTrue) {
      return values;
    } else if (values.length === 2 && values.includes(true) && values.includes(false)) {
      return [true];
    } else {
      return values;
    }
  });
}
