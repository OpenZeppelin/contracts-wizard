<script lang="ts">
  import type { App } from '@modelcontextprotocol/ext-apps';

  import KindShell from './KindShell.svelte';
  import type { HostSendCaps } from './deliver-contract';
  import { NO_HOST_SEND_CAPS } from './deliver-contract';
  import { cloneOpts, nextInitialOpts, optsEqual } from './opts-snapshot';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let initialOpts: any = undefined;
  let errors: KindErrors | undefined;
  let contract: unknown = adapter.emptyContract();

  function mergeHostOpts(incoming: Record<string, unknown> | undefined, source: 'input' | 'result') {
    if (!incoming) return;
    const previous = opts;
    opts = { ...(opts ?? {}), ...incoming, kind };
    initialOpts = nextInitialOpts(initialOpts, previous, opts, source);
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

  /** True once the user edits away from the opening tool-run snapshot. */
  $: drifted = opts != null && initialOpts != null && !optsEqual(opts, initialOpts);
  $: code = adapter.print(contract);
  $: highlightedCode = hostSendCaps.openLinks
    ? adapter.injectHyperlinks(adapter.highlight(code))
    : adapter.highlight(code);
  $: hasErrors = errors !== undefined;

  function restoreOriginal() {
    if (initialOpts == null) return;
    opts = cloneOpts(initialOpts);
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
