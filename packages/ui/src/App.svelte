<script lang="ts">
    import 'highlight.js/styles/atom-one-dark.css';

    import hljs from './highlightjs';

    import LabeledInput from './LabeledInput.svelte';
    import SvgIcon from './SvgIcon.svelte';
    import { mdiContentCopy } from '@mdi/js';

    import type { ERC20Options } from '@openzeppelin/wizard';
    import { buildERC20, printContract } from '@openzeppelin/wizard';
    import { postConfig } from './post-config';

    const opts: Required<ERC20Options> = {
      name: "MyToken",
      symbol: "MTK",
      burnable: false,
      snapshots: false,
      pausable: false,
      premint: undefined,
      mintable: false,
      access: 'ownable',
    };

    let code: string = '';
    let highlightedCode: string = '';

    $: code = printContract(buildERC20(opts));
    $: highlightedCode = hljs.highlight('solidity', code).value;

    const copyHandler = async () => {
      await navigator.clipboard.writeText(code);
      await postConfig(opts, 'copy');
    }
</script>

<div class="container flex-ver gap-lg pad-lg">
  <div class="header flex-hor justify">
    <div class="kind flex-hor justify align-center gap">
      <button class="selected">ERC20</button>
      <button disabled>ERC721</button>
      <button disabled>ERC777</button>
      <button disabled>ERC1155</button>
      <div class="coming-soon">Coming soon!</div>
    </div>

    <div class="action">
      <button on:click={copyHandler}>
        <SvgIcon path={mdiContentCopy}>
          Copy to Clipboard
        </SvgIcon>
      </button>
    </div>
  </div>

  <div class="flex-hor gap-lg grow">
    <div class="controls">
      <section class="settings">
        <h1>Settings</h1>

        <div class="flex-ver gap-lg">
          <div class="cols-2-1">
            <LabeledInput label="Name" bind:value={opts.name} />
            <LabeledInput label="Symbol" bind:value={opts.symbol} />
          </div>
          <LabeledInput label="Premint" bind:value={opts.premint} placeholder="Amount" type="number" min="0" />
        </div>
      </section>

      <section>
        <h1>Features</h1>

        <label class="checkbox" class:checked={opts.burnable}>
          <input type="checkbox" bind:checked={opts.burnable}>
          Burnable
        </label>
        <label class="checkbox" class:checked={opts.snapshots}>
          <input type="checkbox" bind:checked={opts.snapshots}>
          Snapshots
        </label>
        <label class="checkbox" class:checked={opts.pausable}>
          <input type="checkbox" bind:checked={opts.pausable}>
          Pausable
        </label>
        <label class="checkbox" class:checked={opts.mintable}>
          <input type="checkbox" bind:checked={opts.mintable}>
          Mintable
        </label>
      </section>

      <section>
        <h1>Access Control</h1>

        <label class="checkbox" class:checked={opts.access === 'ownable'}>
          <input type="radio" bind:group={opts.access} value="ownable">
          Ownable
        </label>
        <label class="checkbox" class:checked={opts.access === 'roles'}>
          <input type="radio" bind:group={opts.access} value="roles">
          Roles
        </label>
      </section>
    </div>

    <div class="output flex-ver grow scrollable">
    <pre class="flex-ver grow scrollable">
    <code class="hljs grow basis-0 scrollable">
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
    box-shadow: 0 2px 3px rgba(0, 0, 0, .1);
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
    width: 16em;
    background-color: white;
    padding: 1em;
  }

  .controls, .output {
    border-radius: 5px;
    box-shadow: 0 2px 3px rgba(0, 0, 0, .1);
  }

  .controls section + section {
    margin-top: 1.5em;
    padding-top: 1em;
    border-top: 1px solid var(--gray-2);
  }

  .controls h1 {
    margin-top: 0;
    margin-bottom: 1em;
    text-transform: lowercase;
    font-variant: small-caps;
    font-size: 1em;
    color: var(--gray-4);
  }

  .controls label {
    display: block;
  }

  .controls .checkbox {
    padding: .5em;
  }

  .controls .checkbox.checked {
    background-color: var(--blue-1);
  }

  .output pre {
    margin: 0;
  }
</style>
