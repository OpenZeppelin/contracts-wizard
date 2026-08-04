<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import type { App } from '@modelcontextprotocol/ext-apps';
  import type { HostSendCaps } from './deliver-contract';
  import {
    canSendToHost,
    copyContractToClipboard,
    deliverContractToHost,
    HandoffCancelledError,
    NO_HOST_SEND_CAPS,
    openExternalLink,
  } from './deliver-contract';
  import { MCP_EXTERNAL_LINKS_CONTEXT, type McpExternalLinks } from '../common/external-links';

  export let highlightedCode: string;
  export let hasErrors = false;
  export let highlightClass = '-solidity';
  export let code = '';
  /** Markdown fence language used when handing the contract to the agent. */
  export let fence: string;
  export let hostConnected = false;
  export let hostConnectError: string | undefined = undefined;
  export let hostSendCaps: HostSendCaps = NO_HOST_SEND_CAPS;
  export let mcpApp: App;
  /** True when options differ from the opening tool-run snapshot. */
  export let drifted = false;
  export let onRestoreOriginal: (() => void) | undefined = undefined;

  let sending = false;
  let doneLabel: string | undefined = undefined;
  let errorMessage: string | undefined = undefined;
  let statusMessage: string | undefined = undefined;
  let doneTimer: ReturnType<typeof setTimeout> | undefined;
  let restoreConfirming = false;

  $: if (!drifted) restoreConfirming = false;

  // Outbound anchors are routed by the capture-phase delegate below, so consumers
  // (HelpTooltip) only need to know whether an outbound link can be opened at all.
  const externalLinks = writable<McpExternalLinks>({ canOpen: false });
  setContext(MCP_EXTERNAL_LINKS_CONTEXT, externalLinks);

  $: externalLinks.set({ canOpen: hostSendCaps.openLinks });

  // Some tippy content is raw HTML handed straight to tippy (the Superchain notice), so it cannot
  // read the context above and hide its own link. Flag the unopenable case on the root element and
  // hide those links in CSS, so a link is never shown that the capture delegate would swallow.
  $: document.documentElement.classList.toggle('mcp-no-open-links', !hostSendCaps.openLinks);

  $: sendSupported = canSendToHost(hostSendCaps);
  $: copyOnly = hostConnected && !sendSupported;
  $: buttonDisabled = hasErrors || sending || !code || !hostConnected || !!hostConnectError || !!doneLabel;

  function flashDone(label: string) {
    if (doneTimer) clearTimeout(doneTimer);
    doneLabel = label;
    doneTimer = setTimeout(() => {
      doneLabel = undefined;
      doneTimer = undefined;
    }, 1000);
  }

  async function handleUse() {
    if (buttonDisabled) return;
    errorMessage = undefined;
    statusMessage = undefined;
    sending = true;
    try {
      if (copyOnly) {
        await copyContractToClipboard(code);
        flashDone('Copied');
        return;
      }
      await deliverContractToHost(mcpApp, code, fence);
      flashDone('Sent');
    } catch (e: unknown) {
      if (e instanceof HandoffCancelledError) {
        statusMessage = e.message;
        return;
      }
      console.error('[mcp-apps] Send Updates to Agent failed', e);
      errorMessage = e instanceof Error ? e.message : String(e);
      try {
        await copyContractToClipboard(code);
        flashDone('Copied');
      } catch {
        // Clipboard unavailable; the send failure is already reported.
      }
    } finally {
      sending = false;
    }
  }

  /**
   * Route outbound `<a href>` clicks matching `selector` through the host's openLink.
   * `source` names the click origin in failure logs — the host console is the only place these
   * surface, so keep it human-readable rather than echoing the selector.
   */
  function anchorClickHandler(selector: string, source: string) {
    return (event: MouseEvent) => {
      const target = event.target;
      const href = target instanceof Element ? target.closest(selector)?.getAttribute('href') : undefined;
      if (!href || href.startsWith('#')) return;
      // Swallow the click even when the host cannot open links, so a raw target="_blank" anchor in
      // tippy HTML never navigates the app iframe. This is unconditional for the code preview too,
      // which is safe only because KindApp applies injectHyperlinks solely when openLinks is on —
      // un-gate that and outbound clicks in the preview would start being dropped silently.
      event.preventDefault();
      event.stopPropagation();
      if (!hostSendCaps.openLinks) return;
      void openExternalLink(mcpApp, href).catch(e => console.warn(`[mcp-apps] ${source} openLink failed`, e));
    };
  }

  const handleCodeClick = anchorClickHandler('a[href]', 'code preview');
  // Tippy content mounts on document.body (outside .mcp-shell), so in-app click handlers never see it.
  // Capture outbound <a href> clicks from any tippy HTML content and route through host openLink.
  const handleTippyClick = anchorClickHandler('.tippy-box a[href]', 'tippy');

  onMount(() => {
    document.addEventListener('click', handleTippyClick, true);
    return () => document.removeEventListener('click', handleTippyClick, true);
  });
</script>

<div class="mcp-shell flex flex-col gap-2 p-2 min-h-0">
  <div class="flex flex-row grow min-h-0 overflow-hidden rounded-xl border border-[var(--gray-3)]">
    <div
      class="controls min-w-[14rem] w-60 max-w-[42%] flex flex-col shrink-0 overflow-auto border-r border-[var(--gray-3)]"
    >
      <slot name="controls" />
    </div>

    <div class="output flex flex-col grow min-w-0 overflow-hidden">
      <!-- Click delegation for import hyperlinks → host openLink (keyboard via real anchors when present). -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <pre class="flex flex-col grow basis-0 overflow-auto m-0" on:click={handleCodeClick}>
        <code class="hljs {highlightClass} grow overflow-auto p-2 {hasErrors ? 'no-select' : ''}"
          >{@html highlightedCode}</code
        >
      </pre>
    </div>
  </div>

  <div class="footer shrink-0">
    {#if drifted}
      <div class="drift-notice">
        <p class="drift-text">
          Preview differs from the original tool run. The agent's reply from that run still matches the original
          settings. Send updates to the agent for it to see the new code.
        </p>
      </div>
    {/if}
    <div class="actions" class:drifted>
      {#if drifted && onRestoreOriginal}
        {#if restoreConfirming}
          <span class="restore-confirm">
            Restore original settings?
            <button
              type="button"
              class="restore-confirm-btn"
              on:click={() => {
                restoreConfirming = false;
                onRestoreOriginal();
              }}>Confirm</button
            >
            <button type="button" class="restore-confirm-btn cancel" on:click={() => (restoreConfirming = false)}
              >Cancel</button
            >
          </span>
        {:else}
          <button type="button" class="restore-link" on:click={() => (restoreConfirming = true)}
            >Restore original</button
          >
        {/if}
      {/if}
      <button
        class="use-button"
        class:disabled={buttonDisabled}
        class:drifted
        disabled={buttonDisabled}
        title={copyOnly ? 'Copy to Clipboard' : undefined}
        on:click={handleUse}
      >
        {#if !hostConnected && !hostConnectError}
          Connecting…
        {:else if sending}
          {copyOnly ? 'Copying…' : 'Sending…'}
        {:else if doneLabel}
          {doneLabel}
        {:else if copyOnly}
          Copy to Clipboard
        {:else}
          Send Updates to Agent
        {/if}
      </button>
    </div>
    {#if hostConnectError}
      <p class="status error">Could not connect to host: {hostConnectError}</p>
    {:else if errorMessage}
      <p class="status error">{errorMessage}</p>
    {:else if statusMessage}
      <p class="status hint">{statusMessage}</p>
    {/if}
  </div>
</div>

<style lang="postcss">
  .mcp-shell {
    /* Fixed height avoids MCP Apps autoResize collapse with height:100% (ext-apps#143).
       --mcp-app-height is set from MCP_APP_HEIGHT_PX by mount.ts, which reports the same
       value to the host, so the shell and the iframe cannot disagree. */
    height: var(--mcp-app-height);
    min-height: var(--mcp-app-height);
    background-color: var(--gray-1);
    box-sizing: border-box;
    /* Apps-only density: rem tokens inherit into Controls without touching web Wizard. */
    font-size: 12px;
    --text-small: 0.75rem;
    --size-1: 0.2rem;
    --size-2: 0.35rem;
    --size-3: 0.55rem;
    --size-4: 0.7rem;
  }

  .mcp-shell :global(.controls) {
    padding: var(--size-3);
  }

  .mcp-shell :global(pre code.hljs) {
    font-size: 0.7rem;
    line-height: 1.35;
  }

  .footer {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .drift-notice {
    padding: 0.4rem 0.55rem;
    border: 1px solid var(--gray-3);
    border-radius: 8px;
    background: color-mix(in srgb, var(--gray-2) 65%, transparent);
  }

  .drift-text {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.4;
    color: var(--gray-5);
    text-align: left;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
  }

  .actions.drifted {
    justify-content: space-between;
  }

  .restore-link {
    padding: 0;
    border: none;
    background: none;
    color: var(--gray-4);
    font: inherit;
    font-size: 0.75rem;
    text-decoration: underline;
    cursor: pointer;
  }

  .restore-link:hover {
    color: var(--gray-5);
  }

  .restore-confirm {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem 0.5rem;
    font-size: 0.75rem;
    color: var(--gray-5);
  }

  .restore-confirm-btn {
    padding: 0;
    border: none;
    background: none;
    color: var(--solidity-blue-2);
    font: inherit;
    font-size: 0.75rem;
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
  }

  .restore-confirm-btn.cancel {
    color: var(--gray-4);
    font-weight: 500;
  }

  .use-button {
    padding: 0.45rem 0.9rem;
    border-radius: 16px;
    border: 1px solid var(--gray-3);
    background-color: var(--solidity-blue-2);
    color: white;
    font-weight: 600;
    font-size: 0.75rem;
    cursor: pointer;
  }

  .use-button.drifted:not(.disabled):not(:disabled) {
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--solidity-blue-2) 35%, transparent);
  }

  .use-button.disabled,
  .use-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .status {
    margin: 0;
    max-width: 100%;
    font-size: 0.75rem;
    text-align: right;
  }

  .status.hint {
    color: var(--gray-4);
  }

  .status.error {
    color: var(--red-3);
  }

  .no-select {
    user-select: none;
  }

  /*
   * Tippy mounts on document.body, so it does not inherit .mcp-shell density.
   * These rules only ship in MCP App bundles (KindShell is not used by the web Wizard).
   */
  :global(.tippy-box) {
    font-size: 12px;
    line-height: 1.35;
  }

  :global(.tippy-box .tippy-content) {
    padding: 0.35rem 0.5rem;
  }

  /* Host cannot open outbound links, so do not offer any. HelpTooltip already omits its own. */
  :global(html.mcp-no-open-links .tippy-box a[href]) {
    display: none;
  }
</style>
