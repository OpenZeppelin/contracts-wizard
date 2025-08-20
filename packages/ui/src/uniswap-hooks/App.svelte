<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';

  import hljs from './highlightjs';

  import HooksControls from './HooksControls.svelte';
  import CopyIcon from '../common/icons/CopyIcon.svelte';
  import CheckIcon from '../common/icons/CheckIcon.svelte';
  import RemixIcon from '../common/icons/RemixIcon.svelte';
  import OverflowMenu from '../common/OverflowMenu.svelte';
  import Tooltip from '../common/Tooltip.svelte';

  import type { Contract, OptionsErrorMessages } from '@openzeppelin/wizard';
  import type { KindedOptions, Kind } from '@openzeppelin/wizard-uniswap-hooks/src';
  import { sanitizeKind } from '@openzeppelin/wizard-uniswap-hooks/src';

  import { ContractBuilder, OptionsError } from '@openzeppelin/wizard';
  import { buildGeneric } from '@openzeppelin/wizard-uniswap-hooks/src';
  import { postConfig } from '../common/post-config';
  import { remixURL } from './remix';

  import { injectHyperlinks } from './inject-hyperlinks';
  import type { InitialOptions } from '../common/initial-options';
  import ErrorDisabledActionButtons from '../common/ErrorDisabledActionButtons.svelte';
  import { printContract } from '@openzeppelin/wizard-uniswap-hooks/src';

  const dispatch = createEventDispatcher();

  async function allowRendering() {
    showCode = false;
    await tick();
    showCode = true;
  }

  export let initialTab: string | undefined = 'Hooks';

  export let tab: Kind = sanitizeKind(initialTab);
  $: {
    tab = sanitizeKind(tab);
    allowRendering();
    dispatch('tab-change', tab);
  }

  export let initialOpts: InitialOptions = {};
  let initialValuesSet = false;

  let allOpts: { [k in Kind]?: Required<KindedOptions[k]> } = {};
  let errors: { [k in Kind]?: OptionsErrorMessages } = {};

  let contract: Contract = new ContractBuilder(initialOpts.name ?? 'MyHook');

  let showCode = true;

  $: opts = allOpts[tab];

  $: {
    if (opts) {
      if (!initialValuesSet) {
        opts.name = initialOpts.name ?? opts.name;
        switch (opts.kind) {
          case 'Hooks':
        }
        initialValuesSet = true;
      }
      try {
        contract = buildGeneric(opts);
        errors[tab] = undefined;
      } catch (e: unknown) {
        if (e instanceof OptionsError) {
          errors[tab] = e.messages;
        } else {
          throw e;
        }
      }
      allowRendering();
    }
  }

  $: code = printContract(contract);
  $: highlightedCode = injectHyperlinks(hljs.highlight('solidity', code).value);

  $: hasErrors = errors[tab] !== undefined;

  $: showButtons = getButtonVisibilities(opts);

  interface ButtonVisibilities {
    openInRemix: boolean;
  }

  const getButtonVisibilities = (opts?: KindedOptions[Kind]): ButtonVisibilities => {
    return {
      openInRemix: true,
    };
  };

  const language = 'solidity';

  let copied = false;
  const copyHandler = async () => {
    await navigator.clipboard.writeText(code);
    copied = true;
    if (opts) {
      await postConfig(opts, 'copy', language);
    }
    setTimeout(() => {
      copied = false;
    }, 1000);
  };

  const remixHandler = async (e: MouseEvent) => {
    e.preventDefault();
    if ((e.target as Element)?.classList.contains('disabled')) return;

    const { printContractVersioned } = await import('@openzeppelin/wizard/print-versioned');

    const versionedCode = printContractVersioned(contract);
    window.open(remixURL(versionedCode, !!opts?.upgradeable).toString(), '_blank', 'noopener,noreferrer');
    if (opts) {
      await postConfig(opts, 'remix', language);
    }
  };
</script>

<div class="container flex flex-col gap-4 p-4 rounded-3xl">
  <div class="header flex flex-row justify-between">
    <div class="tab overflow-hidden whitespace-nowrap">
      <OverflowMenu>
        <button class:selected={tab === 'Hooks'} on:click={() => (tab = 'Hooks')}> Hooks </button>
      </OverflowMenu>
    </div>

    {#if hasErrors}
      <ErrorDisabledActionButtons />
    {:else}
      <div class="action flex flex-row gap-2 shrink-0">
        <button class="action-button p-3 min-w-[40px]" on:click={copyHandler} title="Copy to Clipboard">
          {#if copied}
            <CheckIcon />
          {:else}
            <CopyIcon />
          {/if}
        </button>

        {#if showButtons.openInRemix}
          <Tooltip let:trigger theme="light-red border" hideOnClick={false} interactive>
            <button use:trigger class="action-button with-text" on:click={remixHandler}>
              <RemixIcon />
              Open in Remix
            </button>
          </Tooltip>
        {/if}
      </div>
    {/if}
  </div>

  <div class="flex flex-row grow">
    <div
      class="controls rounded-l-3xl min-w-72 w-72 max-w-[calc(100vw-420px)] flex flex-col shrink-0 justify-between h-[calc(100vh-84px)] overflow-auto resize-x"
    >
      <div class:hidden={tab !== 'Hooks'}>
        <HooksControls bind:opts={allOpts.Hooks} />
      </div>
    </div>

    <div class="output rounded-r-3xl flex flex-col grow overflow-auto h-[calc(100vh-84px)] relative">
      <pre class="flex flex-col grow basis-0 overflow-auto">
        {#if showCode}
          <code class="hljs -solidity grow overflow-auto p-4 {hasErrors ? 'no-select' : ''}"
            >{@html highlightedCode}</code
          >
        {/if}
      </pre>
    </div>
  </div>
</div>

<style lang="postcss">
  .container {
    background-color: var(--gray-1);
    min-width: 32rem;
  }

  .header {
    font-size: var(--text-small);
  }

  .tab {
    color: var(--gray-5);
  }

  .tab button,
  :global(.overflow-btn) {
    padding: var(--size-2) var(--size-4);
    border-radius: 20px;
    cursor: pointer;
    transition: background-color ease-in-out 0.2s;
  }

  .tab button {
  }

  .tab button,
  :global(.overflow-btn) {
    border: 0;
    background-color: transparent;
  }

  .tab button:hover,
  :global(.overflow-btn):hover {
    background-color: var(--gray-2);
  }

  .tab button.selected {
    background-color: var(--uniswap-pink);
    color: white;
    order: -1;
  }

  :global(.overflow-menu) button.selected {
    order: unset;
  }

  :global(.action-button) {
    padding: 7px;
    border-radius: 20px;
    transition: background-color ease-in-out 0.2s;

    background-color: var(--gray-1);
    border: 1px solid var(--gray-3);
    color: var(--gray-6);
    cursor: pointer;

    &:hover {
      background-color: var(--gray-2);
    }

    &:active :global(.icon) {
      margin: 0 var(--size-1);
    }
  }

  :global(.action-button.disabled) {
    color: var(--gray-4);
  }

  :global(.with-text) {
    padding-right: var(--size-3);
  }

  .controls {
    background-color: white;
    padding: var(--size-4);
  }
</style>
