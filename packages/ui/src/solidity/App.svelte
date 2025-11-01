<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';

  import hljs from './highlightjs';

  import { defaultOverrides, type Overrides } from './overrides';

  import ERC20Controls from './ERC20Controls.svelte';
  import ERC721Controls from './ERC721Controls.svelte';
  import ERC1155Controls from './ERC1155Controls.svelte';
  import StablecoinControls from './StablecoinControls.svelte';
  import RealWorldAssetControls from './RealWorldAssetControls.svelte';
  import AccountControls from './AccountControls.svelte';
  import GovernorControls from './GovernorControls.svelte';
  import CustomControls from './CustomControls.svelte';
  import CopyIcon from '../common/icons/CopyIcon.svelte';
  import CheckIcon from '../common/icons/CheckIcon.svelte';
  import RemixIcon from '../common/icons/RemixIcon.svelte';
  import DownloadIcon from '../common/icons/DownloadIcon.svelte';
  import ZipIcon from '../common/icons/ZipIcon.svelte';
  import FileIcon from '../common/icons/FileIcon.svelte';
  import Dropdown from '../common/Dropdown.svelte';
  import OverflowMenu from '../common/OverflowMenu.svelte';
  import Tooltip from '../common/Tooltip.svelte';

  import type { KindedOptions, Kind, Contract, OptionsErrorMessages } from '@openzeppelin/wizard';
  import { ContractBuilder, buildGeneric, printContract, sanitizeKind, OptionsError } from '@openzeppelin/wizard';
  import { getImports } from '@openzeppelin/wizard/get-imports';
  import { postConfig } from '../common/post-config';
  import { remixURL } from './remix';

  import { saveAs } from 'file-saver';
  import { injectHyperlinks } from './inject-hyperlinks';
  import type { InitialOptions } from '../common/initial-options';
  import type { AiFunctionCall } from '../../api/ai-assistant/types/assistant';
  import ErrorDisabledActionButtons from '../common/ErrorDisabledActionButtons.svelte';
  import { createWiz, mergeAiAssistanceOptions } from '../common/Wiz.svelte';
  import type { Language } from '../common/languages-types';

  const dispatch = createEventDispatcher();

  async function allowRendering() {
    showCode = false;
    await tick();
    showCode = true;
  }

  export let initialTab: string | undefined = 'ERC20';

  export let tab: Kind = sanitizeKind(initialTab);
  $: {
    tab = sanitizeKind(tab);
    allowRendering();
    dispatch('tab-change', tab);
  }

  export let initialOpts: InitialOptions = {};

  /**
   * Allows ecosystem Wizard apps that inherit the Solidity Wizard UI to override specific features.
   * See @type Overrides for details.
   *
   * For Solidity itself, defaultOverrides must be used.
   */
  export let overrides: Overrides = defaultOverrides;

  const WizSolidity = overrides.aiAssistant?.svelteComponent ?? createWiz<'solidity'>();

  let initialValuesSet = false;

  let allOpts: { [k in Kind]?: Required<KindedOptions[k]> } = {};
  let errors: { [k in Kind]?: OptionsErrorMessages } = {};

  let contract: Contract = new ContractBuilder(initialOpts.name ?? 'MyToken');

  let showCode = true;

  $: opts = allOpts[tab];

  $: {
    if (opts) {
      overrides.sanitizeOmittedFeatures(opts);

      if (!initialValuesSet) {
        opts.name = initialOpts.name ?? opts.name;
        switch (opts.kind) {
          case 'ERC20':
            opts.premint = initialOpts.premint ?? opts.premint;
          case 'ERC721':
            opts.symbol = initialOpts.symbol ?? opts.symbol;
            break;
          case 'ERC1155':
          case 'Stablecoin':
          case 'RealWorldAsset':
          case 'Account':
          case 'Governor':
          case 'Custom':
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

  $: showButtons = getButtonVisibilities(overrides, opts);

  interface ButtonVisibilities {
    openInRemix: boolean;
    downloadHardhat: boolean;
    downloadFoundry: boolean;
  }

  const getButtonVisibilities = (overrides: Overrides, opts?: KindedOptions[Kind]): ButtonVisibilities => {
    const result = {
      openInRemix: true,
      downloadHardhat: true,
      downloadFoundry: true,
    };
    switch (opts?.kind) {
      case 'Governor':
        result.downloadHardhat = false;
        result.downloadFoundry = false;
        break;
      case 'Stablecoin':
      case 'RealWorldAsset':
        result.openInRemix = false;
        result.downloadHardhat = false;
        result.downloadFoundry = false;
        break;
    }
    if (overrides.omitZipHardhat) {
      result.downloadHardhat = false;
    }
    if (overrides.omitZipFoundry) {
      result.downloadFoundry = false;
    }
    return result;
  };

  const getSolcSources = (contract: Contract) => {
    const sources = getImports(contract);
    sources[contract.name] = { content: code };
    return sources;
  };

  const language: Language = overrides.postConfigLanguage ?? 'solidity';

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
    window.open(
      remixURL(versionedCode, !!opts?.upgradeable, overrides?.remix?.url).toString(),
      '_blank',
      'noopener,noreferrer',
    );
    if (opts) {
      await postConfig(opts, 'remix', language);
    }
  };

  const downloadNpmHandler = async () => {
    const blob = new Blob([code], { type: 'text/plain' });
    if (opts) {
      saveAs(blob, opts.name + '.sol');
      await postConfig(opts, 'download-file', language);
    }
  };

  const zipHardhatModule = import('@openzeppelin/wizard/zip-env-hardhat');

  const downloadHardhatHandler = async () => {
    const { zipHardhat } = await zipHardhatModule;
    const zip = await zipHardhat(contract, opts);
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'project.zip');
    if (opts) {
      await postConfig(opts, 'download-hardhat', language);
    }
  };

  const zipFoundryModule = import('@openzeppelin/wizard/zip-env-foundry');

  const downloadFoundryHandler = async () => {
    const { zipFoundry } = await zipFoundryModule;
    const zip = await zipFoundry(contract, opts);
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'project.zip');
    if (opts) {
      await postConfig(opts, 'download-foundry', language);
    }
  };

  const applyFunctionCall = ({ detail: aiFunctionCall }: CustomEvent<AiFunctionCall<'solidity'>>) => {
    tab = sanitizeKind(aiFunctionCall.name);
    allOpts = mergeAiAssistanceOptions(allOpts, aiFunctionCall);
  };

  $: wizLanguage = (overrides.aiAssistant?.language ?? 'solidity') as 'solidity';
</script>

<div class="container flex flex-col gap-4 p-4 rounded-3xl">
  <WizSolidity
    language={wizLanguage}
    bind:currentOpts={opts}
    bind:currentCode={code}
    on:function-call-response={applyFunctionCall}
    experimentalContracts={['Stablecoin', 'RealWorldAsset']}
    sampleMessages={['Make a token with supply of 10 million', 'What does mintable do?', 'Make a contract for a DAO']}
  />

  <div class="header flex flex-row justify-between">
    <div class="tab overflow-hidden whitespace-nowrap">
      <OverflowMenu>
        <button class:selected={tab === 'ERC20'} on:click={() => (tab = 'ERC20')}> ERC20 </button>
        <button class:selected={tab === 'ERC721'} on:click={() => (tab = 'ERC721')}> ERC721 </button>
        <button class:selected={tab === 'ERC1155'} on:click={() => (tab = 'ERC1155')}> ERC1155 </button>
        <button class:selected={tab === 'Stablecoin'} on:click={() => (tab = 'Stablecoin')}> Stablecoin* </button>
        <button class:selected={tab === 'RealWorldAsset'} on:click={() => (tab = 'RealWorldAsset')}>
          Real-World Asset*
        </button>
        {#if !overrides.omitTabs.includes('Account')}
          <button class:selected={tab === 'Account'} on:click={() => (tab = 'Account')}> Account </button>
        {/if}
        <button class:selected={tab === 'Governor'} on:click={() => (tab = 'Governor')}> Governor </button>
        <button class:selected={tab === 'Custom'} on:click={() => (tab = 'Custom')}> Custom </button>
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
          <Tooltip
            let:trigger
            disabled={!(opts?.upgradeable === 'transparent')}
            theme="light-red border"
            hideOnClick={false}
            interactive
          >
            <button
              use:trigger
              class="action-button with-text"
              class:disabled={opts?.upgradeable === 'transparent'}
              on:click={remixHandler}
            >
              <RemixIcon />
              {overrides?.remix?.label ?? 'Open in Remix'}
            </button>
            <div slot="content">
              Transparent upgradeable contracts are not supported on Remix. Try using Remix with UUPS upgradability or
              use Hardhat or Foundry with
              <a href="https://docs.openzeppelin.com/upgrades-plugins/" target="_blank" rel="noopener noreferrer"
                >OpenZeppelin Upgrades</a
              >.
              <br />
              <!-- svelte-ignore a11y-invalid-attribute -->
              <a href="#" on:click={remixHandler}>Open in Remix anyway</a>.
            </div>
          </Tooltip>
        {/if}

        <Dropdown let:active>
          <button class="action-button with-text" class:active slot="button">
            <DownloadIcon />
            Download
          </button>

          <button class="download-option" on:click={downloadNpmHandler}>
            <FileIcon />
            <div class="download-option-content">
              <p>Single file</p>
              <p>Requires installation of npm package (<code>@openzeppelin/contracts</code>).</p>
              <p>Simple to receive updates.</p>
            </div>
          </button>

          {#if showButtons.downloadHardhat}
            <button class="download-option" on:click={downloadHardhatHandler}>
              <ZipIcon />
              <div class="download-option-content">
                <p>Development Package (Hardhat)</p>
                <p>Sample Hardhat project to get started with development and testing.</p>
              </div>
            </button>
          {/if}

          {#if showButtons.downloadFoundry}
            <button class="download-option" on:click={downloadFoundryHandler}>
              <ZipIcon />
              <div class="download-option-content">
                <p>Development Package (Foundry)</p>
                <p>Sample Foundry project to get started with development and testing.</p>
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
      <div class:hidden={tab !== 'ERC20'}>
        <ERC20Controls
          bind:opts={allOpts.ERC20}
          errors={errors.ERC20}
          omitFeatures={overrides.omitFeatures.get('ERC20')}
        />
      </div>
      <div class:hidden={tab !== 'ERC721'}>
        <ERC721Controls bind:opts={allOpts.ERC721} errors={errors.ERC721} />
      </div>
      <div class:hidden={tab !== 'ERC1155'}>
        <ERC1155Controls bind:opts={allOpts.ERC1155} />
      </div>
      <div class:hidden={tab !== 'Stablecoin'}>
        <StablecoinControls
          bind:opts={allOpts.Stablecoin}
          errors={errors.Stablecoin}
          omitFeatures={overrides.omitFeatures.get('Stablecoin')}
        />
      </div>
      <div class:hidden={tab !== 'RealWorldAsset'}>
        <RealWorldAssetControls
          bind:opts={allOpts.RealWorldAsset}
          errors={errors.RealWorldAsset}
          omitFeatures={overrides.omitFeatures.get('RealWorldAsset')}
        />
      </div>
      <div class:hidden={tab !== 'Account'}>
        <AccountControls bind:opts={allOpts.Account} errors={errors.Account} />
      </div>
      <div class:hidden={tab !== 'Governor'}>
        <GovernorControls bind:opts={allOpts.Governor} errors={errors.Governor} />
      </div>
      <div class:hidden={tab !== 'Custom'}>
        <CustomControls bind:opts={allOpts.Custom} />
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
  .button-bg:hover {
    transform: translateX(-2px);
    transition: transform 300ms;
  }

  .hide-deploy {
    transform: translateX(-320px);
    transition: transform 0.45s;
  }
  .hide-deploy button {
    background-color: white;
    border: 1px solid white;
  }

  .hide-deploy:hover {
    transform: translatex(-318px);
  }

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
    background-color: var(--solidity-blue-2);
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

    &:active,
    &.active {
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
      opacity: 0.8;
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

    :not(:hover) + & {
      border-top: 1px solid var(--gray-2);
    }

    &:hover,
    &:focus {
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
