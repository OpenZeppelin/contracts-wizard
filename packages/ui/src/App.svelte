<script lang="ts">
    import 'highlight.js/styles/atom-one-dark.css';

    import hljs from './highlightjs';

    import ERC20Controls from './ERC20Controls.svelte';
    import CopyIcon from './icons/CopyIcon.svelte';

    import type { ERC20Options } from '@openzeppelin/wizard';
    import { buildERC20, printContract } from '@openzeppelin/wizard';
    import { postConfig } from './post-config';

    let opts: Required<ERC20Options>;

    let code: string = '';
    let highlightedCode: string = '';

    $: if (opts) {
      code = printContract(buildERC20(opts));
      highlightedCode = hljs.highlight('solidity', code).value;
    }

    const copyHandler = async () => {
      await navigator.clipboard.writeText(code);
      await postConfig(opts, 'copy');
    }
</script>

<div class="container flex flex-col gap-4 p-4">
  <div class="header flex flex-row justify-between">
    <div class="kind flex flex-row items-center gap-2">
      <button class="selected">ERC20</button>
      <button disabled>ERC721</button>
      <button disabled>ERC777</button>
      <button disabled>ERC1155</button>
      <div class="coming-soon">Coming soon!</div>
    </div>

    <div class="action flex flex-row gap-2">
      <button class="flex flex-row items-center" on:click={copyHandler}>
        <CopyIcon />
        Copy to Clipboard
      </button>
    </div>
  </div>

  <div class="flex flex-row gap-4 flex-grow">
    <div class="controls w-64 flex flex-col flex-shrink-0 gap-4">
      <ERC20Controls bind:opts />
    </div>

    <div class="output flex flex-col flex-grow overflow-auto">
    <pre class="flex flex-col flex-grow flex-basis-0 overflow-auto">
    <code class="hljs flex-grow overflow-auto">
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
  }

  .header button {
    padding: .5em .7em;
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
    padding: 1em;
  }

  .controls, .output {
    border-radius: 5px;
    box-shadow: var(--shadow);
  }

  .output pre {
    margin: 0;
  }
</style>
