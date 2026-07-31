/** Deep-clone options for an immutable mount snapshot. */
export function cloneOpts<T>(value: T): T {
  return structuredClone(value);
}

export function optsEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Capture / refresh the "original" options from the opening tool run.
 * First host apply wins; a later toolresult may replace the snapshot only while
 * the UI is still at that original (no user drift yet).
 */
export function nextInitialOpts(
  initial: unknown | undefined,
  previousOpts: unknown | undefined,
  nextOpts: unknown,
  source: 'input' | 'result',
): unknown {
  if (initial == null) {
    return cloneOpts(nextOpts);
  }
  if (source === 'result' && (previousOpts == null || optsEqual(previousOpts, initial))) {
    return cloneOpts(nextOpts);
  }
  return initial;
}
