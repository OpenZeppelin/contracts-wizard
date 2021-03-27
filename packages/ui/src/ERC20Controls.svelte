<script lang="ts">
  import Tooltip from './Tooltip.svelte';

  import type { GenericOptions } from '@openzeppelin/wizard';
  import { premintPattern } from '@openzeppelin/wizard';

  import AccessControlSection from './AccessControlSection.svelte';

  export const opts: Required<GenericOptions> = {
    kind: 'ERC20',
    name: 'MyToken',
    symbol: 'MTK',
    burnable: false,
    snapshots: false,
    pausable: false,
    premint: '',
    mintable: false,
    access: 'ownable',
  };
</script>

<section class="controls-section">
  <h1>Settings</h1>

    <div class="grid grid-cols-2-1 grid-gap-2">
      <label class="labeled-input">
        <span>Name</span>
        <input bind:value={opts.name}>
      </label>
      <label class="labeled-input">
        <span>Symbol</span>
        <input bind:value={opts.symbol}>
      </label>
    </div>
    <label class="labeled-input">
      <span class="flex justify-between pr-2">Premint <Tooltip>Create an initial amount of tokens for the deployer.</Tooltip></span>
      <input bind:value={opts.premint} placeholder="0" pattern={premintPattern.source}>
    </label>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.mintable}>
      <input type="checkbox" bind:checked={opts.mintable}>
      Mintable
      <Tooltip link="https://docs.openzeppelin.com/contracts/3.x/api/token/erc20#ERC20Mintable">
        Makes the token mintable by privileged accounts.
      </Tooltip>
    </label>
    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable}>
      Burnable
      <Tooltip link="https://docs.openzeppelin.com/contracts/3.x/api/token/erc20#ERC20Burnable">
        Provide a function for holders to destroy their tokens.
      </Tooltip>
    </label>
    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable}>
      Pausable
      <Tooltip link="https://docs.openzeppelin.com/contracts/3.x/api/utils#Pausable">
        Provides a modifier that can pause contract functionality when requested by a privileged account. Useful for emergency response.
      </Tooltip>
    </label>
    <label class:checked={opts.snapshots}>
      <input type="checkbox" bind:checked={opts.snapshots}>
      Snapshots
      <Tooltip link="https://docs.openzeppelin.com/contracts/3.x/api/token/erc20#ERC20Snapshot">
        Ability to store snapshots of balances that can be retrieved later. Useful for weighted voting.
      </Tooltip>
    </label>
  </div>
</section>

<AccessControlSection bind:access={opts.access} />