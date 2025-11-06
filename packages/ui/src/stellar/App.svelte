<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';

  import hljs from './highlightjs';

  import JSZip from 'jszip';

  import FungibleControls from './FungibleControls.svelte';
  import NonFungibleControls from './NonFungibleControls.svelte';
  import StablecoinControls from './StablecoinControls.svelte';
  import CopyIcon from '../common/icons/CopyIcon.svelte';
  import CheckIcon from '../common/icons/CheckIcon.svelte';
  import DownloadIcon from '../common/icons/DownloadIcon.svelte';
  import Dropdown from '../common/Dropdown.svelte';
  import OverflowMenu from '../common/OverflowMenu.svelte';
  import FileIcon from '../common/icons/FileIcon.svelte';
  import ErrorDisabledActionButtons from '../common/ErrorDisabledActionButtons.svelte';

  import type { KindedOptions, Kind, Contract, OptionsErrorMessages } from '@openzeppelin/wizard-stellar';
  import {
    ContractBuilder,
    buildGeneric,
    printContract,
    sanitizeKind,
    OptionsError,
  } from '@openzeppelin/wizard-stellar';
  import { postConfig, type DownloadAction } from '../common/post-config';

  import { saveAs } from 'file-saver';
  import { injectHyperlinks } from './inject-hyperlinks';
  import type { InitialOptions } from '../common/initial-options';
  import { createWiz, mergeAiAssistanceOptions } from '../common/Wiz.svelte';
  import type { AiFunctionCall } from '../../api/ai-assistant/types/assistant';
  import ZipIcon from '../common/icons/ZipIcon.svelte';
  import type { GenericOptions } from '@openzeppelin/wizard-stellar/src';
  import type { Language } from '../common/languages-types';

  const WizStellar = createWiz<'stellar'>();

  const dispatch = createEventDispatcher();

  let showCode = true;
  async function allowRendering() {
    showCode = false;
    await tick();
    showCode = true;
  }

  interface ButtonVisibilities {
    downloadScaffold: boolean;
    downloadRust: boolean;
  }

  const getButtonVisibilities = (opts?: KindedOptions[Kind]): ButtonVisibilities => {
    return {
      downloadScaffold: true,
      downloadRust: true,
    };
  };

  type ZipFunction = (c: Contract, opts: KindedOptions[Kind]) => Promise<JSZip>;

  export const downloadZip = async (
    zipFunction: ZipFunction,
    zipAction: DownloadAction,
    language: Language,
    contract: Contract,
    opts?: KindedOptions[Kind],
  ) => {
    if (!opts) throw new Error('No options provided for zip generation');

    const zip = await zipFunction(contract, opts);
    const blob = await zip.generateAsync({ type: 'blob' });

    saveAs(blob, 'project.zip');

    if (opts) await postConfig(opts, zipAction, language);
  };

  $: showButtons = getButtonVisibilities(opts);

  const zipScaffoldModule = import('@openzeppelin/wizard-stellar/zip-env-scaffold');

  const downloadScaffoldHandler = async () => {
    const { zipScaffoldProject } = await zipScaffoldModule;

    await downloadZip(zipScaffoldProject, 'download-scaffold', 'stellar', contract, opts);
  };

  const zipRustModule = import('@openzeppelin/wizard-stellar/zip-env-rust');

  const downloadRustHandler = async () => {
    const { zipRustProject } = await zipRustModule;

    await downloadZip(zipRustProject, 'download-rust-stellar', 'stellar', contract, opts);
  };

  export let initialTab: string | undefined = 'Fungible';

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
          case 'Fungible':
            opts.premint = initialOpts.premint ?? opts.premint;
            break;
          case 'Stablecoin':
            opts.premint = initialOpts.premint ?? opts.premint;
            break;
          case 'NonFungible':
            break;
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
      const name = 'name' in opts ? opts.name : 'MyContract';
      saveAs(blob, name + '.rs');
      await postConfig(opts, 'download-file', language);
    }
  };

  const applyFunctionCall = ({ detail: aiFunctionCall }: CustomEvent<AiFunctionCall<'stellar'>>) => {
    tab = sanitizeKind(aiFunctionCall.name);
    allOpts = mergeAiAssistanceOptions(allOpts, aiFunctionCall);
  };
</script>

<div class="container flex flex-col gap-4 p-4 rounded-3xl">
  <WizStellar
    language="stellar"
    bind:currentOpts={opts}
    bind:currentCode={code}
    on:function-call-response={applyFunctionCall}
    sampleMessages={['Make a fungible token with supply of 10', 'What does mintable do?']}
  ></WizStellar>

  <div class="header flex flex-row justify-between">
    <div class="tab overflow-hidden">
      <OverflowMenu>
        <button class:selected={tab === 'Fungible'} on:click={() => (tab = 'Fungible')}> Fungible </button>
        <button class:selected={tab === 'NonFungible'} on:click={() => (tab = 'NonFungible')}> NonFungible </button>
        <button class:selected={tab === 'Stablecoin'} on:click={() => (tab = 'Stablecoin')}> Stablecoin </button>
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

          {#if showButtons.downloadScaffold}
            <button class="download-option" on:click={downloadScaffoldHandler}>
              <ZipIcon />
              <div class="download-option-content">
                <p>Scaffold Stellar Package</p>
                <p>Sample Scaffold Stellar project to get started with development and testing.</p>
              </div>
            </button>
          {/if}

          {#if showButtons.downloadRust}
            <button class="download-option" on:click={downloadRustHandler}>
              <ZipIcon />
              <div class="download-option-content">
                <p>Rust Development Package</p>
                <p>Sample Rust project to get started with development and testing.</p>
              </div>
            </button>
          {/if}
        </Dropdown>
      </div>
    {/if}
  </div>

  <div class="flex flex-row grow">
    <div
      class="controls rounded-l-3xl min-w-72 w-72 max-w-[calc(100vw-420px)] flex flex-col shrink-0 justify-between h-[calc(100vh-84px)] overflow-auto resize-x"
    >
      <div class:hidden={tab !== 'Fungible'}>
        <FungibleControls bind:opts={allOpts.Fungible} errors={errors.Fungible} />
      </div>
      <div class:hidden={tab !== 'NonFungible'}>
        <NonFungibleControls bind:opts={allOpts.NonFungible} errors={errors.NonFungible} />
      </div>
      <div class:hidden={tab !== 'Stablecoin'}>
        <StablecoinControls bind:opts={allOpts.Stablecoin} errors={errors.Stablecoin} />
      </div>
    </div>
    <div class="output rounded-r-3xl flex flex-col grow overflow-auto h-[calc(100vh-84px)]">
      <pre class="flex flex-col grow basis-0 overflow-auto">
        {#if showCode}
          <code class="hljs -stellar grow overflow-auto p-4">{@html highlightedCode}</code>
        {/if}
    </pre>
    </div>
  </div>
</div>

<style lang="postcss">
  .tab button.selected {
    background-color: var(--stellar-black);
    color: white;
    order: -1;
  }
</style>
