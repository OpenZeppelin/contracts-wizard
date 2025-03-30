<script lang="ts">
    import { createEventDispatcher, tick } from 'svelte';

    import hljs from './highlightjs';

    import FungibleControls from './FungibleControls.svelte';
    import CopyIcon from '../common/icons/CopyIcon.svelte';
    import CheckIcon from '../common/icons/CheckIcon.svelte';
    import DownloadIcon from '../common/icons/DownloadIcon.svelte';
    import Dropdown from '../common/Dropdown.svelte';
    import OverflowMenu from '../common/OverflowMenu.svelte';
    import FileIcon from '../common/icons/FileIcon.svelte';
    import ErrorDisabledActionButtons from '../common/ErrorDisabledActionButtons.svelte';

    import type { KindedOptions, Kind, Contract, OptionsErrorMessages } from '@openzeppelin/wizard-stellar';
    import { ContractBuilder, buildGeneric, printContract, sanitizeKind, OptionsError } from '@openzeppelin/wizard-stellar';
    import { postConfig } from '../common/post-config';

    import { saveAs } from 'file-saver';
    import { injectHyperlinks } from './inject-hyperlinks';
    import { InitialOptions } from '../common/initial-options';

    const dispatch = createEventDispatcher();
    
    let showCode = true;
    async function allowRendering() {
      showCode = false;
      await tick();
      showCode = true;
    }

    export let initialTab: string | undefined = 'Fungible';

    export let tab: Kind = sanitizeKind(initialTab);
    $: {
      tab = sanitizeKind(tab);
      dispatch('tab-change', tab);
      allowRendering();
    };

    export let initialOpts: InitialOptions = {};
    let initialValuesSet = false;

    let allOpts: { [k in Kind]?: Required<KindedOptions[k]> } = {};
    let errors: { [k in Kind]?: OptionsErrorMessages } = {};

    let contract: Contract = new ContractBuilder(initialOpts.name ?? 'MyToken');

    $: opts = allOpts[tab];

    $: {
      if (opts) {
        if (!initialValuesSet) {
          opts.name = initialOpts.name ?? opts.name;
          switch (opts.kind) {
            case 'Fungible':
              opts.premint = initialOpts.premint ?? opts.premint;
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
    $: highlightedCode = injectHyperlinks(hljs.highlight(code, {language: 'rust'}).value);

    $: hasErrors = errors[tab] !== undefined;

    const language = 'stellar';

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

    const downloadFileHandler = async () => {
      const blob = new Blob([code], { type: 'text/plain' });
      if (opts) {
        const name = ('name' in opts) ? opts.name : 'MyContract';
        saveAs(blob, name + '.rs');
        await postConfig(opts, 'download-file', language);
      }
    };

</script>

<div class="container flex flex-col gap-4 p-4 rounded-3xl">
  <div class="header flex flex-row justify-between">
    <div class="tab overflow-hidden">
      <OverflowMenu>
        <button class:selected={tab === 'Fungible'} on:click={() => tab = 'Fungible'}>
          Fungible
        </button>
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

      <Dropdown let:active>
        <button class="action-button with-text" class:active slot="button">
          <DownloadIcon />
          Download
        </button>

        <button class="download-option" on:click={downloadFileHandler}>
          <FileIcon />
          <div class="download-option-content">
            <p>Single file</p>
            <p>Requires a Rust project with dependencies on OpenZeppelin Stellar Soroban Contracts.</p>
          </div>
        </button>
      </Dropdown>
    </div>
    {/if}
  </div>

  <div class="flex flex-row grow">
    <div class="controls rounded-l-3xl w-72 flex flex-col shrink-0 justify-between h-[calc(100vh-84px)] overflow-auto">
      <div class:hidden={tab !== 'Fungible'}>
        <FungibleControls bind:opts={allOpts.Fungible} errors={errors.Fungible} />
      </div>
    </div>
    <div class="output rounded-r-3xl flex flex-col grow overflow-auto h-[calc(100vh-84px)]">
      <pre class="flex flex-col grow basis-0 overflow-auto">
        {#if showCode}
          <code class="hljs -stellar grow overflow-auto p-4">{@html highlightedCode}</code>
        {/if}
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

  .tab button, :global(.overflow-btn) {
    padding: var(--size-2) var(--size-3);
    border-radius: 20px;
    cursor: pointer;
    transition: background-color ease-in-out .2s;
  }

  .tab button, :global(.overflow-btn) {
    border: 0;
    background-color: transparent;
  }

  .tab button:hover, :global(.overflow-btn):hover {
    background-color: var(--gray-2);
  }

  .tab button.selected {
    background-color: var(--stellar-black);
    color: white;
    order: -1;
  }

  :global(.overflow-menu) button.selected {
    order: unset;
  }

  :global(.action-button) {
    padding: 7px;
    border-radius: 20px;
    transition: background-color ease-in-out .2s;

    background-color: var(--gray-1);
    border: 1px solid var(--gray-3);
    color: var(--gray-6);
    cursor: pointer;

    &:hover {
      background-color: var(--gray-2);
    }

    &:active, &.active {
      background-color: var(--gray-2);
    }

    :global(.icon) {
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


  .controls-footer {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    color: var(--gray-5);
    margin-top: var(--size-3);
    padding: 0 var(--size-2);
    font-size: var(--text-small);

    & > * + * {
      margin-left: var(--size-3);
    }

    :global(.icon) {
      margin-right: 0.2em;
      opacity: .8;
    }

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        color: var(--text-color);
      }
    }
  }

  .download-option {
    display: flex;
    padding: var(--size-2);
    text-align: left;
    background: none;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;

    :global(.icon) {
      margin-top: var(--icon-adjust);
    }

    &:hover,
    &:focus, {
      background-color: var(--gray-1);
      border: 1px solid var(--gray-3);
    }

    & div {
      display: block;
    }
  }

  .download-option-content {
    margin-left: var(--size-3);
    font-size: var(--text-small);

    & > :first-child {
      margin-bottom: var(--size-2);
      color: var(--gray-6);
      font-weight: bold;
    }

    & > :not(:first-child) {
      margin-top: var(--size-1);
      color: var(--gray-5);
    }
  }

</style>
