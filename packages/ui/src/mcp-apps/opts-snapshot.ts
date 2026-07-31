/** Deep-clone options for an immutable mount snapshot. */
export function cloneOpts<T>(value: T): T {
  return structuredClone(value);
}

export function optsEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Whether this host apply should replace the "original" baseline.
 * First apply always; a later toolresult may refresh only while the UI is still
 * at that original (no user drift yet).
 */
export function shouldRefreshInitial(
  initial: unknown | undefined,
  previousOpts: unknown | undefined,
  source: 'input' | 'result',
): boolean {
  if (initial == null) {
    return true;
  }
  if (source === 'result' && (previousOpts == null || optsEqual(previousOpts, initial))) {
    return true;
  }
  return false;
}

/**
 * Capture / refresh the "original" options from the opening tool run.
 * Prefer calling this with opts *after* Controls have settled (UI coercions such
 * as required access → ownable), so the baseline matches what the form shows.
 */
export function nextInitialOpts(
  initial: unknown | undefined,
  previousOpts: unknown | undefined,
  nextOpts: unknown,
  source: 'input' | 'result',
): unknown {
  if (!shouldRefreshInitial(initial, previousOpts, source)) {
    return initial;
  }
  return cloneOpts(nextOpts);
}
