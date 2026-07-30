<script lang="ts">
  import type { HostSendCaps } from './deliver-contract';
  import { canSendToHost, copyContractToClipboard } from './deliver-contract';

  export let highlightedCode: string;
  export let hasErrors = false;
  export let highlightClass = '-solidity';
  export let code = '';
  export let onUseContract: (code: string) => void | Promise<void> = () => {};
  export let useLabel = 'Send Updates to Agent';
  export let hostConnected = false;
  export let hostConnectError: string | undefined = undefined;
  export let hostSendCaps: HostSendCaps = { message: false, updateModelContext: false };

  let sending = false;
  let doneLabel: string | undefined = undefined;
  let errorMessage: string | undefined = undefined;
  let doneTimer: ReturnType<typeof setTimeout> | undefined;

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
</script>

<div class="mcp-shell flex flex-col gap-2 p-2 min-h-0">
  <div class="flex flex-row grow min-h-0 overflow-hidden rounded-xl border border-[var(--gray-3)]">
    <div
      class="controls min-w-[14rem] w-60 max-w-[42%] flex flex-col shrink-0 overflow-auto border-r border-[var(--gray-3)]"
    >
      <slot name="controls" />
    </div>

    <div class="output flex flex-col grow min-w-0 overflow-hidden">
      <pre class="flex flex-col grow basis-0 overflow-auto m-0">
        <code class="hljs {highlightClass} grow overflow-auto p-2 {hasErrors ? 'no-select' : ''}"
          >{@html highlightedCode}</code
        >
      </pre>
    </div>
  </div>

  <div class="flex flex-col items-end gap-1 shrink-0">
    <button
      class="use-button"
      class:disabled={buttonDisabled}
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
    {#if hostConnectError}
      <p class="status error">Could not connect to host: {hostConnectError}</p>
    {:else if errorMessage}
      <p class="status error">{errorMessage}</p>
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

  .status.error {
    color: #b91c1c;
  }

  .no-select {
    user-select: none;
  }
</style>
