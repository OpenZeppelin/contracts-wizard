<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';

  import hljs from './highlightjs';

  import ERC20Controls from './ERC20Controls.svelte';
  import ERC721Controls from './ERC721Controls.svelte';
  import ERC1155Controls from './ERC1155Controls.svelte';
  import CopyIcon from '../common/icons/CopyIcon.svelte';
  import CheckIcon from '../common/icons/CheckIcon.svelte';
  import DownloadIcon from '../common/icons/DownloadIcon.svelte';
  import Dropdown from '../common/Dropdown.svelte';
  import OverflowMenu from '../common/OverflowMenu.svelte';
  import FileIcon from '../common/icons/FileIcon.svelte';
  import ErrorDisabledActionButtons from '../common/ErrorDisabledActionButtons.svelte';

  import type { KindedOptions, Kind, Contract, OptionsErrorMessages } from '@openzeppelin/wizard-stylus';
  import {
    ContractBuilder,
    buildGeneric,
    printContract,
    sanitizeKind,
    OptionsError,
  } from '@openzeppelin/wizard-stylus';
  import { postConfig } from '../common/post-config';

  import { saveAs } from 'file-saver';
  import { injectHyperlinks } from './inject-hyperlinks';
  import type { InitialOptions } from '../common/initial-options';
  import { createWiz, mergeAiAssistanceOptions } from '../common/Wiz.svelte';
  import type { AiFunctionCall } from '../../api/ai-assistant/types/assistant';

  const dispatch = createEventDispatcher();

  const WizStylus = createWiz<'stylus'>();

  let showCode = true;
  async function allowRendering() {
    showCode = false;
    await tick();
    showCode = true;
  }

  export let initialTab: string | undefined = 'ERC20';

  export let tab: Kind = sanitizeKind(initialTab);
  $: {
    tab = sanitizeKind(tab);
    dispatch('tab-change', tab);
    allowRendering();
  }

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
          case 'ERC20':
          // TODO: uncomment once minting is enabled, see https://github.com/OpenZeppelin/rust-contracts-stylus/issues/547
          // opts.premint = initialOpts.premint ?? opts.premint;
          case 'ERC721':
            // TODO: uncomment once metadata is enabled, see https://github.com/OpenZeppelin/rust-contracts-stylus/issues/558
            // opts.symbol = initialOpts.symbol ?? opts.symbol;
            break;
          case 'ERC1155':
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
  $: highlightedCode = injectHyperlinks(hljs.highlight(code, { language: 'rust' }).value);

  $: hasErrors = errors[tab] !== undefined;

  const language = 'stylus';

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
      const name = 'name' in opts ? opts.name : 'MyContract';
      saveAs(blob, name + '.rs');
      await postConfig(opts, 'download-file', language);
    }
  };

  const applyFunctionCall = ({ detail: aiFunctionCall }: CustomEvent<AiFunctionCall<'stylus'>>) => {
    tab = sanitizeKind(aiFunctionCall.name);
    allOpts = mergeAiAssistanceOptions(allOpts, aiFunctionCall);
  };
</script>

<div class="container flex flex-col gap-4 p-4 rounded-3xl">
  <WizStylus
    language="stylus"
    bind:currentOpts={opts}
    bind:currentCode={code}
    on:function-call-response={applyFunctionCall}
    sampleMessages={['Make a token with flash loan capability', 'What is a flash loan?']}
  />
  <div class="header flex flex-row justify-between">
    <div class="tab overflow-hidden">
      <OverflowMenu>
        <button class:selected={tab === 'ERC20'} on:click={() => (tab = 'ERC20')}> ERC20 </button>
        <button class:selected={tab === 'ERC721'} on:click={() => (tab = 'ERC721')}> ERC721 </button>
        <button class:selected={tab === 'ERC1155'} on:click={() => (tab = 'ERC1155')}> ERC1155 </button>
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
              <p>Requires a Rust project with <code>openzeppelin-stylus</code> as a dependency.</p>
            </div>
          </button>
        </Dropdown>
      </div>
    {/if}
  </div>

  <div class="flex flex-row grow">
    <div
      class="controls rounded-l-3xl min-w-72 w-72 max-w-[calc(100vw-420px)] flex flex-col shrink-0 justify-between h-[calc(100vh-84px)] overflow-auto resize-x"
    >
      <div class:hidden={tab !== 'ERC20'}>
        <ERC20Controls bind:opts={allOpts.ERC20} errors={errors.ERC20} />
      </div>
      <div class:hidden={tab !== 'ERC721'}>
        <ERC721Controls bind:opts={allOpts.ERC721} errors={errors.ERC721} />
      </div>
      <div class:hidden={tab !== 'ERC1155'}>
        <ERC1155Controls bind:opts={allOpts.ERC1155} errors={errors.ERC1155} />
      </div>
    </div>
    <div class="output rounded-r-3xl flex flex-col grow overflow-auto h-[calc(100vh-84px)]">
      <pre class="flex flex-col grow basis-0 overflow-auto">
        {#if showCode}
          <code class="hljs -stylus grow overflow-auto p-4">{@html highlightedCode}</code>
        {/if}
      </pre>
    </div>
  </div>
</div>

<style lang="postcss">
  .tab button.selected {
    background-color: var(--stylus-pink);
    color: white;
    order: -1;
  }
</style>
