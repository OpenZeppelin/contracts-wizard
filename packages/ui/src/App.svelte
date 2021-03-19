<script lang="ts">
    import hljs from './highlightjs';

    import ERC20Controls from './ERC20Controls.svelte';
    import CopyIcon from './icons/CopyIcon.svelte';

    import type { GenericOptions } from '@openzeppelin/wizard';
    import { buildGeneric, printContract } from '@openzeppelin/wizard';
    import { postConfig } from './post-config';

    let opts: Required<GenericOptions>;

    let code: string = '';
    let highlightedCode: string = '';

    $: if (opts) {
      code = printContract(buildGeneric(opts));
      highlightedCode = hljs.highlight('solidity', code).value;
    }

    const copyHandler = async () => {
      await navigator.clipboard.writeText(code);
      await postConfig(opts, 'copy');
    }
</script>

<div class="container flex flex-col flex-col-gap-4 p-4">
  <div class="header flex flex-row justify-between">
    <div class="kind">
      <button class:selected={opts?.kind === 'ERC20'}>ERC20</button>
      <button disabled>ERC721</button>
      <button disabled>ERC777</button>
      <button disabled>ERC1155</button>
      <span class="coming-soon">Coming soon!</span>
    </div>

    <div class="action">
      <button on:click={copyHandler}>
        <CopyIcon />
        Copy to Clipboard
      </button>
    </div>
  </div>

  <div class="flex flex-row flex-row-gap-4 flex-grow">
    <div class="controls w-64 flex flex-col flex-shrink-0">
      <ERC20Controls bind:opts />
    </div>

    <div class="output flex flex-col flex-grow overflow-auto">
    <pre class="flex flex-col flex-grow flex-basis-0 overflow-auto">
    <code class="hljs flex-grow overflow-auto p-4">
    {@html highlightedCode}
    </code>
    </pre>
    </div>
  </div>
</div>

<style>
  .container {
    background-color: var(--gray-1);
    border: 1px solid var(--gray-2);
    border-radius: 10px;
    min-width: var(--size-128);
  }

  .header button {
    padding: var(--size-2) var(--size-3);
    border-radius: 5px;
    font-weight: bold;
  }

  .kind button {
    border: 0;
    background-color: transparent;
  }

  .kind button:hover {
    background-color: var(--gray-2);
  }

  .kind button.selected {
    background-color: var(--blue-2);
    color: white;
  }

  .coming-soon {
    opacity: 0;
    font-size: .8em;
    padding: .4em 1em;
    border-radius: 5px;
    background-color: var(--gray-5);
    color: var(--gray-1);
    box-shadow: var(--shadow);
    transition: opacity .25s ease-out .25s;
  }

  .kind button[disabled]:hover {
    cursor: not-allowed;
  }

  .kind button[disabled]:hover ~ .coming-soon {
    opacity: 1;
    transition: opacity .1s ease-out 0s;
  }

  .action button {
    background-color: transparent;
    border: 1px solid var(--gray-3);
    color: var(--gray-6);
    cursor: pointer;
  }

  .action button:hover {
    background-color: var(--gray-1);
  }

  .action button:active {
    background-color: var(--gray-2);
  }

  .controls {
    background-color: white;
    padding: var(--size-4);
  }

  .controls, .output {
    border-radius: 5px;
    box-shadow: var(--shadow);
  }
</style>
