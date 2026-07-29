<script lang="ts">
  import type { HostSendCaps } from './deliver-contract';
  import { canSendToHost, copyContractToClipboard } from './deliver-contract';

  export let highlightedCode: string;
  export let hasErrors = false;
  export let highlightClass = '-solidity';
  export let code = '';
  export let onUseContract: (code: string) => void | Promise<void> = () => {};
  export let useLabel = 'Send updated contract';
  export let hostConnected = false;
  export let hostConnectError: string | undefined = undefined;
  export let hostSendCaps: HostSendCaps = { message: false, updateModelContext: false };

  let sending = false;
  let statusMessage: string | undefined = undefined;
  let statusIsError = false;

  $: sendSupported = canSendToHost(hostSendCaps);
  $: buttonDisabled = hasErrors || sending || !code || !hostConnected || !!hostConnectError;

  function setStatus(message: string, isError: boolean) {
    statusMessage = message;
    statusIsError = isError;
  }

  async function handleUse() {
    if (buttonDisabled) return;
    statusMessage = undefined;
    sending = true;
    try {
      if (!sendSupported) {
        await copyContractToClipboard(code);
        setStatus('Copied contract to clipboard — paste it into the chat.', false);
        return;
      }
      await onUseContract(code);
      setStatus('Sent updated contract to the agent.', false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('[mcp-apps] Send updated contract failed', e);
      try {
        await copyContractToClipboard(code);
        setStatus(`${message} Copied to clipboard instead.`, true);
      } catch {
        setStatus(message, true);
      }
    } finally {
      sending = false;
    }
  }
</script>

<div class="mcp-shell flex flex-col gap-3 p-3 min-h-0">
  <div class="flex flex-row grow min-h-0 overflow-hidden rounded-2xl border border-[var(--gray-3)]">
    <div
      class="controls min-w-64 w-72 max-w-[45%] flex flex-col shrink-0 overflow-auto border-r border-[var(--gray-3)]"
    >
      <slot name="controls" />
    </div>

    <div class="output flex flex-col grow min-w-0 overflow-hidden">
      <pre class="flex flex-col grow basis-0 overflow-auto m-0">
        {#key highlightedCode}
          <code class="hljs {highlightClass} grow overflow-auto p-4 {hasErrors ? 'no-select' : ''}"
            >{@html highlightedCode}</code
          >
        {/key}
      </pre>
    </div>
  </div>

  <div class="flex flex-col items-end gap-1 shrink-0">
    <button
      class="use-button"
      class:disabled={buttonDisabled}
      disabled={buttonDisabled}
      on:click={handleUse}
    >
      {#if !hostConnected && !hostConnectError}
        Connecting…
      {:else if sending}
        Sending…
      {:else if hostConnected && !sendSupported}
        Copy contract
      {:else}
        {useLabel}
      {/if}
    </button>
    {#if hostConnectError}
      <p class="status error">Could not connect to host: {hostConnectError}</p>
    {:else if statusMessage}
      <p class="status" class:error={statusIsError}>{statusMessage}</p>
    {:else if hostConnected && !sendSupported}
      <p class="status">This host cannot send to chat — copy and paste the contract instead.</p>
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
  }

  .use-button {
    padding: 0.6rem 1.25rem;
    border-radius: 20px;
    border: 1px solid var(--gray-3);
    background-color: var(--solidity-blue-2, #4e5de4);
    color: white;
    font-weight: 600;
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
    color: var(--gray-5, #6b7280);
    text-align: right;
  }

  .status.error {
    color: #b91c1c;
  }

  .no-select {
    user-select: none;
  }
</style>
