/** Deep-clone options for an immutable mount snapshot. */
export function cloneOpts<T>(value: T): T {
  return structuredClone(value);
}

/**
 * Whether the preview has moved off the source the opening tool run asked for.
 *
 * Compares generated source rather than options, so the coercions Controls apply to host options
 * (required `access: false` → `ownable`) are invisible: they describe the same contract the
 * generator would have built anyway. A coercion that changes the source would show up here as a
 * spurious edit, but that is a Controls/generator disagreement to fix at the source, not
 * something this comparison should absorb.
 *
 * `hasErrors` counts on its own because the baseline options build by construction, so an invalid
 * form is always a user edit — and because the preview freezes at its last good value while the
 * build fails, which would otherwise hide the banner and its Restore link exactly when they are
 * needed.
 */
export function isDrifted(state: { originalCode: string | undefined; code: string; hasErrors: boolean }): boolean {
  const { originalCode, code, hasErrors } = state;
  if (originalCode === undefined) {
    return false;
  }
  return hasErrors || code !== originalCode;
}

/**
 * Whether this host apply should (re)capture the original-options baseline.
 *
 * The first apply always captures. A later toolresult may recapture only while the preview has
 * not drifted: until then every value in `opts` came from the host or from a source-preserving
 * coercion, so the newer and more complete host options are the better baseline. Once the user
 * has edited, the opening tool run stays the reference point.
 *
 * Takes the same `drifted` the banner uses, so a form that is merely in an error state — where
 * the preview is stale and would compare equal — still counts as edited and is left alone.
 */
export function shouldCaptureBaseline(
  baselineCode: string | undefined,
  drifted: boolean,
  source: 'input' | 'result',
): boolean {
  if (baselineCode === undefined) {
    return true;
  }
  return source === 'result' && !drifted;
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
 * The fallback matters because host applies accumulate. An agent can call the tool with options
 * that do not build (the tool run itself then errors), and those would otherwise poison every
 * later merge, leaving the baseline unset and drift undetectable for the rest of the session.
 * An apply that does build supersedes them — note this drops options only the earlier apply
 * carried, which is the price of recovering a usable baseline. Undefined when neither builds;
 * a later apply retries.
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
