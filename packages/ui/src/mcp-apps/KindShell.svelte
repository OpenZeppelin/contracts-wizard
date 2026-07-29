<script lang="ts">
  export let highlightedCode: string;
  export let hasErrors = false;
  export let highlightClass = '-solidity';
  export let code = '';
  export let onUseContract: (code: string) => void | Promise<void> = () => {};
  export let useLabel = 'Use this contract';

  let sending = false;

  async function handleUse() {
    if (hasErrors || sending || !code) return;
    sending = true;
    try {
      await onUseContract(code);
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

  <div class="flex flex-row justify-end shrink-0">
    <button
      class="use-button"
      class:disabled={hasErrors || sending || !code}
      disabled={hasErrors || sending || !code}
      on:click={handleUse}
    >
      {sending ? 'Sending…' : useLabel}
    </button>
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

  .no-select {
    user-select: none;
  }
</style>
