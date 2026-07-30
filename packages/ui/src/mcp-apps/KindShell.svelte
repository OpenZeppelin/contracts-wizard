<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import type { App } from '@modelcontextprotocol/ext-apps';
  import type { HostSendCaps } from './deliver-contract';
  import {
    canSendToHost,
    copyContractToClipboard,
    HandoffCancelledError,
    openExternalLink,
  } from './deliver-contract';
  import { MCP_EXTERNAL_LINKS_CONTEXT, type McpExternalLinks } from './external-links';

  export let highlightedCode: string;
  export let hasErrors = false;
  export let highlightClass = '-solidity';
  export let code = '';
  export let onUseContract: (code: string) => void | Promise<void> = () => {};
  export let useLabel = 'Send Updates to Agent';
  export let hostConnected = false;
  export let hostConnectError: string | undefined = undefined;
  export let hostSendCaps: HostSendCaps = { message: false, updateModelContext: false, openLinks: false };
  export let mcpApp: App;
  /** True when options differ from the opening tool-run snapshot. */
  export let drifted = false;
  export let onRestoreOriginal: (() => void) | undefined = undefined;

  let sending = false;
  let doneLabel: string | undefined = undefined;
  let errorMessage: string | undefined = undefined;
  let statusMessage: string | undefined = undefined;
  let doneTimer: ReturnType<typeof setTimeout> | undefined;

  const externalLinks = writable<McpExternalLinks>({
    canOpen: false,
    open: async () => {
      throw new Error('Host link bridge is not ready.');
    },
  });
  setContext(MCP_EXTERNAL_LINKS_CONTEXT, externalLinks);

  $: externalLinks.set({
    canOpen: hostSendCaps.openLinks,
    open: async (url: string) => {
      await openExternalLink(mcpApp, url);
    },
  });

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
      await onUseContract(code);
      flashDone('Sent');
    } catch (e: unknown) {
      if (e instanceof HandoffCancelledError) {
        statusMessage = e.message;
        return;
      }
      const message = e instanceof Error ? e.message : String(e);
      console.error('[mcp-apps] Send Updates to Agent failed', e);
      try {
        await copyContractToClipboard(code);
        flashDone('Copied');
        errorMessage = message;
      } catch {
        errorMessage = message;
      }
    } finally {
      sending = false;
    }
  }

  async function openHrefViaHost(event: MouseEvent, href: string, logLabel: string) {
    event.preventDefault();
    event.stopPropagation();
    if (!hostSendCaps.openLinks) return;
    try {
      await openExternalLink(mcpApp, href);
    } catch (e) {
      console.warn(`[mcp-apps] ${logLabel} openLink failed`, e);
    }
  }

  async function handleCodeClick(event: MouseEvent) {
    if (!hostSendCaps.openLinks) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    await openHrefViaHost(event, href, 'code preview');
  }

  // Tippy content mounts on document.body (outside .mcp-shell), so in-app click handlers never see it.
  // Capture outbound <a href> clicks from any tippy HTML content and route through host openLink.
  function handleTippyClick(event: MouseEvent) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest('.tippy-box a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    void openHrefViaHost(event, href, 'tippy');
  }

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
          Preview differs from the original tool run. The agent's reply from that run still matches the original settings.
          Send updates to the agent for it to see the new code.
        </p>
        {#if onRestoreOriginal}
          <button type="button" class="restore-button" on:click={onRestoreOriginal}>Restore original</button>
        {/if}
      </div>
    {/if}
    <div class="actions">
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
          {useLabel}
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
    /* Fixed height avoids MCP Apps autoResize collapse with height:100% (ext-apps#143). */
    height: 560px;
    min-height: 560px;
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
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.35rem 0.75rem;
    padding: 0.4rem 0.55rem;
    border: 1px solid var(--gray-3);
    border-radius: 8px;
    background: color-mix(in srgb, var(--gray-2, #e5e7eb) 65%, transparent);
  }

  .drift-text {
    margin: 0;
    flex: 1 1 12rem;
    font-size: 0.75rem;
    line-height: 1.4;
    color: var(--gray-5, #4b5563);
    text-align: left;
  }

  .restore-button {
    flex: 0 0 auto;
    padding: 0.25rem 0.55rem;
    border: 1px solid var(--gray-3);
    border-radius: 12px;
    background: white;
    color: var(--gray-5, #4b5563);
    font: inherit;
    font-weight: 600;
    font-size: 0.7rem;
    cursor: pointer;
  }

  .restore-button:hover {
    border-color: var(--gray-4, #9ca3af);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }

  .use-button {
    padding: 0.45rem 0.9rem;
    border-radius: 16px;
    border: 1px solid var(--gray-3);
    background-color: var(--solidity-blue-2, #4e5de4);
    color: white;
    font-weight: 600;
    font-size: 0.75rem;
    cursor: pointer;
  }

  .use-button.drifted:not(.disabled):not(:disabled) {
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--solidity-blue-2, #4e5de4) 35%, transparent);
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
    color: var(--gray-4, #6b7280);
  }

  .status.error {
    color: #b91c1c;
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
</style>
