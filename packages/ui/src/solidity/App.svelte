<script lang="ts">
    import { createEventDispatcher, tick } from 'svelte';

    import hljs from './highlightjs';

    import ERC20Controls from './ERC20Controls.svelte';
    import ERC721Controls from './ERC721Controls.svelte';
    import ERC1155Controls from './ERC1155Controls.svelte';
    import StablecoinControls from './StablecoinControls.svelte';
    import RealWorldAssetControls from './RealWorldAssetControls.svelte';
    import GovernorControls from './GovernorControls.svelte';
    import CustomControls from './CustomControls.svelte';
    import CopyIcon from '../common/icons/CopyIcon.svelte';
    import CheckIcon from '../common/icons/CheckIcon.svelte';
    import RemixIcon from '../common/icons/RemixIcon.svelte';
    import DownloadIcon from '../common/icons/DownloadIcon.svelte';
    import ZipIcon from '../common/icons/ZipIcon.svelte';
    import FileIcon from '../common/icons/FileIcon.svelte';
    import ArrowsLeft from '../common/icons/ArrowsLeft.svelte';
    import ArrowsRight from '../common/icons/ArrowsRight.svelte';
    import Dropdown from '../common/Dropdown.svelte';
    import OverflowMenu from '../common/OverflowMenu.svelte';
    import Tooltip from '../common/Tooltip.svelte';
    import Wiz from './Wiz.svelte';
    import DefenderDeployModal from './DefenderDeployModal.svelte';
    import ErrorDisabledActionButtons from '../common/ErrorDisabledActionButtons.svelte';

    import type { KindedOptions, Kind, Contract, OptionsErrorMessages } from '@openzeppelin/wizard';
    import { ContractBuilder, buildGeneric, printContract, sanitizeKind, OptionsError } from '@openzeppelin/wizard';
    import { getImports } from '@openzeppelin/wizard/get-imports';
    import { postConfig } from '../common/post-config';
    import { remixURL } from './remix';

    import { saveAs } from 'file-saver';
    import { injectHyperlinks } from './inject-hyperlinks';
    import { InitialOptions } from '../common/initial-options';
    import { postMessageToIframe } from '../common/post-message';

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
    };

    export let initialOpts: InitialOptions = {};
    let initialValuesSet = false;

    let showDeployModal = false;

    let allOpts: { [k in Kind]?: Required<KindedOptions[k]> } = {};
    let errors: { [k in Kind]?: OptionsErrorMessages } = {};

    let contract: Contract = new ContractBuilder(initialOpts.name ?? 'MyToken');

    let showCode = true;

    $: functionCall && applyFunctionCall()

    $: opts = allOpts[tab];

    $: {
      if (opts) {
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
    $: showDeployModal = !hasErrors && showDeployModal;

    $: if (showDeployModal) {
      let enforceDeterministicReason: string | undefined;
      let groupNetworksBy: 'superchain' | undefined;

      const isSuperchainERC20 = opts !== undefined &&
        (opts.kind === 'ERC20' || opts.kind === 'Stablecoin' || opts.kind === 'RealWorldAsset') &&
        opts.crossChainBridging === 'superchain';
      if (isSuperchainERC20) {
        enforceDeterministicReason = 'SuperchainERC20 requires deploying your contract to the same address on every chain in the Superchain.';
        groupNetworksBy = 'superchain';
      }

      postMessageToIframe('defender-deploy', {
        kind: 'oz-wizard-defender-deploy',
        sources: getSolcSources(contract),
        enforceDeterministicReason,
        groupNetworksBy,
      });
    }

    $: showButtons = getButtonVisiblities(opts);

    interface ButtonVisibilities {
      openInRemix: boolean;
      downloadHardhat: boolean;
      downloadFoundry: boolean;
    }

    const getButtonVisiblities = (opts?: KindedOptions[Kind]): ButtonVisibilities => {
      if (opts?.kind === "Governor") {
        return {
          openInRemix: true,
          downloadHardhat: false,
          downloadFoundry: false,
        }
      } else if (opts?.kind === "Stablecoin" || opts?.kind === "RealWorldAsset" || (opts?.kind === "ERC20" && opts.crossChainBridging)) {
        return {
          openInRemix: false,
          downloadHardhat: false,
          downloadFoundry: false,
        }
      } else {
        return {
          openInRemix: true,
          downloadHardhat: true,
          downloadFoundry: true,
        }
      }
    }

    const getSolcSources = (contract: Contract) => {
      const sources = getImports(contract);
      sources[contract.name] = { content: code };
      return sources;
    }

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

    const nameMap = {
      erc20: 'ERC20',
      erc721: 'ERC721',
      erc1155: 'ERC1155',
      stablecoin: 'Stablecoin',
      realworldasset: 'RealWorldAsset',
      governor: 'Governor',
      custom: 'Custom',
    }

    let functionCall: {
      name?: string,
      opts?: any
    } = {}

    const applyFunctionCall = () => {
      if (functionCall.name) {
        const name = functionCall.name as keyof typeof nameMap
        tab = sanitizeKind(nameMap[name])

        allOpts[tab] = {
          ...allOpts[tab],
          ...functionCall.opts
        }
      }
    }
</script>

<div class="container flex flex-col gap-4 p-4 rounded-3xl">
  <Wiz bind:functionCall={functionCall} bind:currentOpts={opts}></Wiz>
  
  <div class="header flex flex-row justify-between">
    <div class="tab overflow-hidden whitespace-nowrap">
      
      <OverflowMenu>
        <button class:selected={tab === 'ERC20'} on:click={() => tab = 'ERC20'}>
          ERC20
        </button>
        <button class:selected={tab === 'ERC721'} on:click={() => tab = 'ERC721'}>
          ERC721
        </button>
        <button class:selected={tab === 'ERC1155'} on:click={() => tab = 'ERC1155'}>
          ERC1155
        </button>
        <button class:selected={tab === 'Stablecoin'} on:click={() => tab = 'Stablecoin'}>
          Stablecoin*
        </button>
        <button class:selected={tab === 'RealWorldAsset'} on:click={() => tab = 'RealWorldAsset'}>
          Real-World Asset*
        </button>
        <button class:selected={tab === 'Governor'} on:click={() => tab = 'Governor'}>
          Governor
        </button>
        <button class:selected={tab === 'Custom'} on:click={() => tab = 'Custom'}>
          Custom
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

        {#if showButtons.openInRemix}
        <Tooltip
          let:trigger
          disabled={!(opts?.upgradeable === "transparent")}
          theme="light-red border"
          hideOnClick={false}
          interactive
        >
          <button
            use:trigger
            class="action-button with-text"
            class:disabled={opts?.upgradeable === "transparent"}
            on:click={remixHandler}
          >
            <RemixIcon />
            Open in Remix
          </button>
          <div slot="content">
            Transparent upgradeable contracts are not supported on Remix.
            Try using Remix with UUPS upgradability or use Hardhat or Foundry with
            <a href="https://docs.openzeppelin.com/upgrades-plugins/" target="_blank" rel="noopener noreferrer">OpenZeppelin Upgrades</a>.
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
    <div class="controls rounded-l-3xl w-72 flex flex-col shrink-0 justify-between h-[calc(100vh-84px)] overflow-auto">
      <div class:hidden={tab !== 'ERC20'}>
        <ERC20Controls bind:opts={allOpts.ERC20} errors={errors.ERC20}/>
      </div>
      <div class:hidden={tab !== 'ERC721'}>
        <ERC721Controls bind:opts={allOpts.ERC721} />
      </div>
      <div class:hidden={tab !== 'ERC1155'}>
        <ERC1155Controls bind:opts={allOpts.ERC1155} />
      </div>
      <div class:hidden={tab !== 'Stablecoin'}>
        <StablecoinControls bind:opts={allOpts.Stablecoin} errors={errors.Stablecoin} />
      </div>
      <div class:hidden={tab !== 'RealWorldAsset'}>
        <RealWorldAssetControls bind:opts={allOpts.RealWorldAsset} errors={errors.RealWorldAsset} />
      </div>
      <div class:hidden={tab !== 'Governor'}>
        <GovernorControls bind:opts={allOpts.Governor} errors={errors.Governor} />
      </div>
      <div class:hidden={tab !== 'Custom'}>
        <CustomControls bind:opts={allOpts.Custom} />
      </div>
    </div>

    <div class="output rounded-r-3xl flex flex-col grow overflow-auto h-[calc(100vh-84px)] relative">
      {#if !hasErrors}
      <div class="absolute p-px right-6 rounded-full top-4 z-10 {showDeployModal ? 'hide-deploy' : ''}">
        <button
          class="text-sm border-solid border p-2 pr-4 rounded-full cursor-pointer flex items-center gap-2 transition-all pl-2 bg-white border-white"
          on:click={() => (showDeployModal = !showDeployModal)}
        >
          <ArrowsRight />
        </button>
      </div>
      <div class="button-bg absolute p-px right-4 rounded-full top-4 z-10">
        <button
          class="text-sm border-solid border p-2 pr-4 rounded-full cursor-pointer flex items-center gap-2 transition-all pl-4 bg-indigo-600 border-indigo-600 text-white"
          on:click={
            async () => {
              if (opts) {
                await postConfig(opts, 'defender', language);
              }
              showDeployModal = !showDeployModal;
            }
          }
        >
        <ArrowsLeft /> Deploy
        </button>
      </div>
      {/if}
      <pre class="flex flex-col grow basis-0 overflow-auto">
        {#if showCode}
          <code class="hljs -solidity grow overflow-auto p-4 {hasErrors ? 'no-select' : ''}">{@html highlightedCode}</code>
        {/if}
      </pre>
      <DefenderDeployModal isOpen={showDeployModal} />
    </div>
  </div>
</div>

<style lang="postcss">
 /* deploy with defender button border animation start*/
  @property --angle{
  syntax: '<angle>'; 
  inherits: false;
  initial-value: 40deg;
	}
	@property --spread{
  syntax: '<angle>'; 
  inherits: false;
  initial-value: 0deg;
	}
  @property --x {
    syntax: '<length>';
    inherits: false;
    initial-value: 0px;
  }
  @property --y {
    syntax: '<length>';
    inherits: false;
    initial-value: 0px;
  }
  @property --blur{
    syntax: '<length>';
    inherits: false;
    initial-value: 0px;  
  }
@keyframes conic-effect {
  0% {
    --angle: 40deg;
		--spread: 0deg;
    --x: 0px;
    --y: 0px;
    --blur: 0px;
  }
	10% {
    --x: 2px;
    --y: -2px;
	}
  20% {
    --blur: 15px;
		--spread: 80deg;
  }

	30% {
    --x: -2px;
    --y: -2px;
	}
	40% {
    --angle: 320deg; 
		--spread: 00deg;
    --x: 0px;
    --y: 0px;
    --blur: 0px;
  }
  100% {
    --angle: 320deg;
		--spread: 0deg;
    --x: 0px;
    --y: 0px;
    --blur: 0px;
  }
}

.no-select {
  user-select: none;
}

.button-bg{
  animation: conic-effect 12s ease-in-out infinite;
  animation-delay: 4.2s;
  background: conic-gradient(#4f46e5 calc(var(--angle) - var(--spread)),#7E7ADA var(--angle),rgb(79, 70, 229) calc(var(--angle) + var(--spread)));
  box-shadow: var(--x) var(--y) var(--blur) #9793da45;
  display: inline-flex;
  transition: transform 300ms;
}
/* end deploy with defender button border animation */

.button-bg:hover {
  transform: translateX(-2px);
  transition: transform 300ms;
}

.hide-deploy {
  transform: translateX(-320px);
  transition: transform 0.45s;
}
.hide-deploy button{
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

  .tab button, :global(.overflow-btn) {
    padding: var(--size-2) var(--size-4);
    border-radius: 20px;
    cursor: pointer;
    transition: background-color ease-in-out .2s;
  }

  .tab button{
    
  }

  .tab button, :global(.overflow-btn) {
    border: 0;
    background-color: transparent;
  }

  .tab button:hover, :global(.overflow-btn):hover {
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

    :not(:hover) + & {
      border-top: 1px solid var(--gray-2);
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
