<script lang="ts">
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
    };

    let code: string = '';

    $: code = printContract(buildERC20(opts));
</script>

<main>
  <h1>OpenZeppelin Wizard</h1>

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
  </p>

  <pre>
  <code>
  {code}
  </code>
  </pre>
</main>

<style>
	main {
		padding: 1em;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

    pre {
      font-size: 1.5em;
    }
</style>
