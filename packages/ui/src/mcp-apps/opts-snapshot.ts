/** Deep-clone options for an immutable mount snapshot. */
export function cloneOpts<T>(value: T): T {
  return structuredClone(value);
}

/**
 * Whether this host apply should (re)capture the original-options baseline.
 *
 * The first apply always captures. A later toolresult may recapture only while the
 * preview still prints the baseline source; once the user has edited, the opening
 * tool run stays the reference point.
 *
 * Both codes come from the currently loaded generator, so this compares generated
 * source rather than options objects: UI coercions that leave the source unchanged
 * (e.g. required `access: false` → `ownable`) do not count as a user edit.
 */
export function shouldCaptureBaseline(
  baselineCode: string | undefined,
  currentCode: string | undefined,
  source: 'input' | 'result',
): boolean {
  if (baselineCode === undefined) {
    return true;
  }
  return source === 'result' && currentCode === baselineCode;
}

export type Baseline<T> = {
  /** The original options, to build the baseline source and to restore from. */
  opts: T;
  code: string;
  /** The merged options do not build, so `opts` replaces them rather than only baselining them. */
  supersedesOpts: boolean;
};

/**
 * The baseline for this host apply: the merged options if they build, else the incoming
 * options alone.
 *
 * The fallback matters because host applies accumulate. One unbuildable apply (a host that
 * streams partial toolinput arguments) would otherwise poison every later merge, leaving the
 * baseline unset and drift undetectable for the rest of the session. An apply that does build
 * supersedes those stale arguments. Undefined when neither builds; a later apply retries.
 */
export function nextBaseline<T>(
  merged: T,
  incoming: T,
  print: (opts: T) => string | undefined,
): Baseline<T> | undefined {
  const mergedCode = print(merged);
  if (mergedCode !== undefined) {
    return { opts: cloneOpts(merged), code: mergedCode, supersedesOpts: false };
  }
  const incomingCode = print(incoming);
  if (incomingCode !== undefined) {
    return { opts: cloneOpts(incoming), code: incomingCode, supersedesOpts: true };
  }
  return undefined;
}
