<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import hljs from './highlightjs';

    import ERC20Controls from './ERC20Controls.svelte';
    import ERC721Controls from './ERC721Controls.svelte';
    import ERC1155Controls from './ERC1155Controls.svelte';
    import GovernorControls from './GovernorControls.svelte';
    import CustomControls from './CustomControls.svelte';
    import CopyIcon from './icons/CopyIcon.svelte';
    import CheckIcon from './icons/CheckIcon.svelte';
    import RemixIcon from './icons/RemixIcon.svelte';
    import DownloadIcon from './icons/DownloadIcon.svelte';
    import ZipIcon from './icons/ZipIcon.svelte';
    import FileIcon from './icons/FileIcon.svelte';
    import OzIcon from './icons/OzIcon.svelte';
    import Dropdown from './Dropdown.svelte';
    import OverflowMenu from './OverflowMenu.svelte';
    import Tooltip from './Tooltip.svelte';
    import Wiz from './Wiz.svelte';

    import type { KindedOptions, Kind, Contract, OptionsErrorMessages } from '@openzeppelin/wizard';
    import { ContractBuilder, buildGeneric, printContract, sanitizeKind, OptionsError } from '@openzeppelin/wizard';
    import { postConfig } from './post-config';
    import { remixURL } from './remix';

    import { saveAs } from 'file-saver';
    import { injectHyperlinks } from './utils/inject-hyperlinks';
    import { InitialOptions } from './initial-options';

    const dispatch = createEventDispatcher();

    export let initialTab: string | undefined = 'ERC20';

    export let tab: Kind = sanitizeKind(initialTab);
    $: {
      tab = sanitizeKind(tab);
      dispatch('tab-change', tab);
    };

    export let initialOpts: InitialOptions = {};
    let initialValuesSet = false;

    let allOpts: { [k in Kind]?: Required<KindedOptions[k]> } = {};
    let errors: { [k in Kind]?: OptionsErrorMessages } = {};

    let contract: Contract = new ContractBuilder(initialOpts.name ?? 'MyToken');

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
      }
    }

    $: code = printContract(contract);
    $: highlightedCode = injectHyperlinks(hljs.highlight('solidity', code).value);

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
        await postConfig(opts, 'download-npm', language);
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

<div class="container flex flex-col gap-4 p-4">
  <Wiz bind:functionCall={functionCall} bind:currentOpts={opts}></Wiz>

  <div class="header flex flex-row justify-between">
    <div class="tab overflow-hidden">
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
        <button class:selected={tab === 'Governor'} on:click={() => tab = 'Governor'}>
          Governor
        </button>
        <button class:selected={tab === 'Custom'} on:click={() => tab = 'Custom'}>
          Custom
        </button>
      </OverflowMenu>
    </div>

    <div class="action flex flex-row gap-2 shrink-0">
      <a href="https://docs.openzeppelin.com/defender/v2/tutorial/deploy?utm_campaign=Defender%20GA_2024&utm_source=Wizard#environment_setup" target="_blank" rel="noopener noreferrer">
        <button class="action-button min-w-[165px]">
          <OzIcon />
          Deploy with Defender
        </button>
      </a>

      <button class="action-button min-w-[165px]" on:click={copyHandler}>
        {#if copied}
          <CheckIcon />
          Copied
        {:else}
          <CopyIcon />
          Copy to Clipboard
        {/if}
      </button>

      <Tooltip
        let:trigger
        disabled={!(opts?.upgradeable === "transparent")}
        theme="light-red border"
        hideOnClick={false}
        interactive
      >
        <button
          use:trigger
          class="action-button"
          class:disabled={opts?.upgradeable === "transparent"}
          on:click={remixHandler}
        >
          <RemixIcon />
          Open in Remix
        </button>
        <div slot="content">
          Transparent upgradeable contracts are not supported on Remix.
          Try using Remix with UUPS upgradability or use Hardhat or Truffle with
          <a href="https://docs.openzeppelin.com/upgrades-plugins/" target="_blank" rel="noopener noreferrer">OpenZeppelin Upgrades</a>.
          <br />
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a href="#" on:click={remixHandler}>Open in Remix anyway</a>.
        </div>
      </Tooltip>

      <Dropdown let:active>
        <button class="action-button" class:active slot="button">
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

        {#if opts?.kind !== "Governor"}
        <button class="download-option" on:click={downloadHardhatHandler}>
          <ZipIcon />
          <div class="download-option-content">
            <p>Development Package (Hardhat)</p>
            <p>Sample Hardhat project to get started with development and testing.</p>
          </div>
        </button>
        {/if}

        {#if opts?.kind !== "Governor"}
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
  </div>

  <div class="flex flex-row gap-4 grow">
    <div class="controls w-64 flex flex-col shrink-0 justify-between h-[calc(100vh-84px)] overflow-auto">
      <div class:hidden={tab !== 'ERC20'}>
        <ERC20Controls bind:opts={allOpts.ERC20} />
      </div>
      <div class:hidden={tab !== 'ERC721'}>
        <ERC721Controls bind:opts={allOpts.ERC721} />
      </div>
      <div class:hidden={tab !== 'ERC1155'}>
        <ERC1155Controls bind:opts={allOpts.ERC1155} />
      </div>
      <div class:hidden={tab !== 'Governor'}>
        <GovernorControls bind:opts={allOpts.Governor} errors={errors.Governor} />
      </div>
      <div class:hidden={tab !== 'Custom'}>
        <CustomControls bind:opts={allOpts.Custom} />
      </div>
    </div>

    <div class="output flex flex-col grow overflow-auto h-[calc(100vh-84px)]">
      <pre class="flex flex-col grow basis-0 overflow-auto"><code class="hljs grow overflow-auto p-4">{@html highlightedCode}</code></pre>
    </div>
  </div>
</div>

<style lang="postcss">
  .container {
    background-color: var(--gray-1);
    border: 1px solid var(--gray-2);
    border-radius: 10px;
    min-width: 32rem;
  }

  .header {
    font-size: var(--text-small);
  }

  .tab {
    color: var(--gray-5);
  }

  .tab button, .action-button, :global(.overflow-btn) {
    padding: var(--size-2) var(--size-3);
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
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

  .action-button {
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

    &.disabled {
      color: var(--gray-4);
    }

    :global(.icon) {
      margin-right: var(--size-1);
    }
  }

  .controls {
    background-color: white;
    padding: var(--size-4);
  }

  .controls, .output {
    border-radius: 5px;
    box-shadow: var(--shadow);
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
