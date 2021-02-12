<script lang="ts">
    import 'highlight.js/styles/github.css';

    import hljs from './highlightjs';

    import type { ERC20Options } from '@openzeppelin/wizard';
    import { buildERC20, printContract } from '@openzeppelin/wizard';

    const opts: ERC20Options = {
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

    $: code = hljs.highlight('solidity', printContract(buildERC20(opts))).value;
</script>

<main>
  <h1>OpenZeppelin Contracts Wizard</h1>

  <div class="app">
    <div class="form">
      <p>
      <label><input type="radio" checked> ERC20</label>
      <input bind:value={opts.name}>
      <br>
      <input bind:value={opts.symbol}>
      <br>
      <label><input type="checkbox" bind:checked={opts.burnable}> Burnable</label>
      <label><input type="checkbox" bind:checked={opts.snapshots}> Snapshots</label>
      <label><input type="checkbox" bind:checked={opts.pausable}> Pausable</label>
      <label><input type="checkbox" bind:checked={opts.mintable}> Mintable</label>
      <input bind:value={opts.premint} placeholder="Premint">
      <br>
      Access Control
      <label><input type="radio" bind:group={opts.access} value="ownable"> Ownable</label>
      <label><input type="radio" bind:group={opts.access} value="roles"> Roles</label>
      </p>
    </div>

    <pre class="output">
    <code class="hljs">
    {@html code}
    </code>
    </pre>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .app {
    display: flex;
    width: 1100px;
  }

  .form {
    flex: 1;
  }

  .output {
    flex: 2;
  }

  pre {
    font-size: 1.5em;
  }
</style>
