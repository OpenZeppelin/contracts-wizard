<script lang="ts">
    import hljs from './highlightjs';

    import ERC20Controls from './ERC20Controls.svelte';
    import ERC721Controls from './ERC721Controls.svelte';
    import CopyIcon from './icons/CopyIcon.svelte';
    import RemixIcon from './icons/RemixIcon.svelte';
    import DownloadIcon from './icons/DownloadIcon.svelte';
    import ZipIcon from './icons/ZipIcon.svelte';
    import FileIcon from './icons/FileIcon.svelte';
    import Dropdown from './Dropdown.svelte';
    import Tooltip from './Tooltip.svelte';
    import OverflowMenu from './OverflowMenu.svelte';

    import type { GenericOptions } from '@openzeppelin/wizard';
    import { ContractBuilder, buildGeneric, printContract, zipContract } from '@openzeppelin/wizard';
    import { postConfig } from './post-config';
    import { remixURL } from './remix';

    import { saveAs } from 'file-saver';

    type Kind = GenericOptions['kind'];
    let kind: Kind = 'ERC20';
    let allOpts: { [k in Kind]?: Required<GenericOptions> } = {};

    $: opts = allOpts[kind];
    $: contract = opts ? buildGeneric(opts) : new ContractBuilder('MyToken');
    $: code = printContract(contract);
    $: highlightedCode = hljs.highlight('solidity', code).value;

    const copyHandler = async () => {
      await navigator.clipboard.writeText(code);
      if (opts) {
        await postConfig(opts, 'copy');
      }
    };

    const remixHandler = async () => {
      window.open(remixURL(code).toString(), '_blank');
      if (opts) {
        await postConfig(opts, 'remix');
      }
    };

    const downloadNpmHandler = async () => {
      const blob = new Blob([code], { type: 'text/plain' });
      if (opts) {
        saveAs(blob, opts.name + '.sol');
        await postConfig(opts, 'download-npm');
      }
    };

    const downloadVendoredHandler = async () => {
      const zip = zipContract(contract);
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, 'contracts.zip');
      if (opts) {
        await postConfig(opts, 'download-vendored');
      }
    };
</script>

<div class="container flex flex-col flex-row-gap-4 p-4">
  <div class="header flex flex-row justify-between">
    <div class="kind overflow-hidden">
      <OverflowMenu let:overflow>
        <button class:selected={kind === 'ERC20'} on:click={() => kind = 'ERC20'}>
          ERC20
        </button>
        <button class:selected={kind === 'ERC721'} on:click={() => kind = 'ERC721'}>
          ERC721
        </button>
        <Tooltip let:trigger text="Coming soon!" placement={overflow ? 'left' : 'bottom'}>
          <button use:trigger class="disabled" aria-disabled="true">ERC777</button>
        </Tooltip>
        <Tooltip let:trigger text="Coming soon!" placement={overflow ? 'left' : 'bottom'}>
          <button use:trigger class="disabled" aria-disabled="true">ERC1155</button>
        </Tooltip>
      </OverflowMenu>
    </div>

    <div class="action flex flex-row flex-col-gap-4 flex-shrink-0">
      <button class="action-button" on:click={copyHandler}>
        <CopyIcon />
        Copy to Clipboard
      </button>

      <button class="action-button" on:click={remixHandler}>
        <RemixIcon />
        Open in Remix
      </button>

      <Dropdown let:active>
        <button class="action-button" class:active slot="button">
          <DownloadIcon />
          Download
        </button>

        <button class="download-option" on:click={downloadNpmHandler}>
          <span>
            Single file
            <FileIcon />
          </span>
          <span>
            Requires installation of npm package (<code>@openzeppelin/contracts</code>).
            <br>
            Simple to receive updates.
          </span>
        </button>

        <button class="download-option" on:click={downloadVendoredHandler}>
          <span>
            <span>
              Vendored ZIP
              <span class="download-zip-beta">Beta</span>
            </span>
            <ZipIcon />
          </span>
          <span>
            Does not require npm package.
            <br>
            Must be updated manually.
          </span>
        </button>
      </Dropdown>
    </div>
  </div>

  <div class="flex flex-row flex-col-gap-4 flex-grow">
    <div class="controls w-64 flex flex-col flex-shrink-0">
      <div class={kind === 'ERC20' ? 'display-contents' : 'display-none'}>
        <ERC20Controls bind:opts={allOpts.ERC20} />
      </div>
      <div class={kind === 'ERC721' ? 'display-contents' : 'display-none'}>
        <ERC721Controls bind:opts={allOpts.ERC721} />
      </div>
    </div>

    <div class="output flex flex-col flex-grow overflow-auto">
    <pre class="flex flex-col flex-grow flex-basis-0 overflow-auto">
    <code class="hljs flex-grow overflow-auto p-4">
    {@html highlightedCode}
    </code>
    </pre>
    </div>
  </div>

  <div class="footer">
    <p>For secure operations of your smart contracts sign up free at <a href="https://defender.openzeppelin.com/">defender.openzeppelin.com</a></p>
  </div>
</div>

<style>
  .container {
    background-color: var(--gray-1);
    border: 1px solid var(--gray-2);
    border-radius: 10px;
    min-width: 32rem;
    min-height: 40rem;
  }

  .kind {
    color: var(--gray-5);
  }

  .kind button, .action-button, :global(.overflow-btn) {
    padding: var(--size-2) var(--size-3);
    border-radius: 5px;
    font-weight: bold;
  }

  .kind button, :global(.overflow-btn) {
    border: 0;
    background-color: transparent;
  }

  .kind button:hover, :global(.overflow-btn):hover {
    background-color: var(--gray-2);
  }

  .kind button.selected {
    background-color: var(--blue-2);
    color: white;
    order: -1;
  }

  :global(.overflow-menu) button.selected {
    order: unset;
  }

  .kind button.disabled {
    color: var(--gray-3);
  }

  .kind button.disabled:hover {
    cursor: not-allowed;
  }

  .action-button {
    background-color: var(--gray-1);
    border: 1px solid var(--gray-3);
    color: var(--gray-6);
    cursor: pointer;
  }

  .action-button:active, .action-button.active {
    background-color: var(--gray-2);
  }

  .action-button :global(.icon) {
    margin-right: var(--size-1);
  }

  .controls {
    align-self: flex-start;
    background-color: white;
    padding: var(--size-4);
  }

  .controls, .output {
    border-radius: 5px;
    box-shadow: var(--shadow);
  }

  .download-option {
    display: flex;
    flex-direction: column;
    padding: var(--size-3);
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      background-color: var(--gray-1);
    }

    &:not(:first-child) {
      border-top: 1px solid var(--gray-2);
    }

    & > :first-child {
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;

      :global(.icon) {
        float: right;
      }
    }

    & > :not(:first-child) {
      margin-top: var(--size-1);
      font-size: var(--text-small);
    }
  }

  .download-zip-beta {
    text-transform: uppercase;
    padding: 0 .2em;
    border: 1px solid;
    border-radius: 5px;
    font-size: .8em;
    margin-left: .25em;
  }
</style>
