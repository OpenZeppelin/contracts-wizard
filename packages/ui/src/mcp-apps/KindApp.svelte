<script lang="ts">
  import type { App } from '@modelcontextprotocol/ext-apps';

  import KindShell from './KindShell.svelte';
  import type { HostSendCaps } from './deliver-contract';
  import { NO_HOST_SEND_CAPS } from './deliver-contract';
  import { cloneOpts, nextBaseline, shouldCaptureBaseline } from './opts-snapshot';
  import type { KindAdapter, KindErrors } from './adapter';

  /** Supplies everything language-specific; see `adapter.ts`. */
  export let adapter: KindAdapter;
  export let kind: string;
  export let mcpApp: App;
  export let hostConnected = false;
  export let hostConnectError: string | undefined = undefined;
  export let hostSendCaps: HostSendCaps = NO_HOST_SEND_CAPS;

  // Bound by the active Controls component (same pattern as App.svelte allOpts[tab])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let opts: any = undefined;
  /** Options exactly as the opening tool run requested them; what `Restore original` restores. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let originalOpts: any = undefined;
  /** What *this* generator prints for `originalOpts` — the baseline the preview is compared to. */
  let originalCode: string | undefined = undefined;
  let errors: KindErrors | undefined;
  let contract: unknown = adapter.emptyContract();

  function printOpts(candidate: unknown): string | undefined {
    try {
      return adapter.print(adapter.build(candidate));
    } catch {
      // Partial or invalid host arguments (e.g. streamed toolinput); a later apply retries.
      return undefined;
    }
  }

  function mergeHostOpts(incoming: Record<string, unknown> | undefined, source: 'input' | 'result') {
    if (!incoming) return;
    // Judged against the pre-merge preview, so a user edit blocks a toolresult recapture.
    const captureBaseline = shouldCaptureBaseline(originalCode, code, source);
    const merged = { ...(opts ?? {}), ...incoming, kind };
    opts = merged;
    if (!captureBaseline) return;

    // Baseline the options the tool run *asked for*, printed by the generator loaded now —
    // never the source in the agent's reply. Implied defaults (access: false → ownable) and
    // generator upgrades both print identically here, so neither reads as a user edit.
    const baseline = nextBaseline(merged, { ...incoming, kind }, printOpts);
    if (baseline === undefined) return;
    originalOpts = baseline.opts;
    originalCode = baseline.code;
    if (baseline.supersedesOpts) {
      opts = cloneOpts(baseline.opts);
    }
  }

  mcpApp.ontoolinput = params => {
    mergeHostOpts(params.arguments as Record<string, unknown> | undefined, 'input');
  };

  mcpApp.ontoolresult = result => {
    const structured = result.structuredContent as { opts?: Record<string, unknown> } | undefined;
    if (structured?.opts) {
      mergeHostOpts(structured.opts, 'result');
    }
  };

  $: if (opts) {
    try {
      contract = adapter.build(opts);
      errors = undefined;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      errors = adapter.optionsErrors(e) ?? { _: message || 'Failed to build contract' };
    }
  }

  $: code = adapter.print(contract);
  $: highlightedCode = hostSendCaps.openLinks
    ? adapter.injectHyperlinks(adapter.highlight(code))
    : adapter.highlight(code);
  $: hasErrors = errors !== undefined;
  // `hasErrors` counts as drift on its own: the tool run's own options build, so an invalid
  // form is always a user edit, and `contract` (hence `code`) is stale while the build fails.
  /** True once the user edits away from the source the opening tool run asked for. */
  $: drifted = originalCode !== undefined && (hasErrors || code !== originalCode);

  function restoreOriginal() {
    if (originalOpts == null) return;
    opts = cloneOpts(originalOpts);
  }
</script>

<KindShell
  {highlightedCode}
  {hasErrors}
  {code}
  highlightClass={adapter.highlightClass}
  fence={adapter.fence}
  {hostConnected}
  {hostConnectError}
  {hostSendCaps}
  {mcpApp}
  {drifted}
  onRestoreOriginal={restoreOriginal}
>
  <svelte:fragment slot="controls">
    <svelte:component this={adapter.controls[kind]} bind:opts {errors} {...adapter.controlProps?.(kind, opts) ?? {}} />
  </svelte:fragment>
</KindShell>
