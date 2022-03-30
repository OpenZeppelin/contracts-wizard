<script lang="ts">
  import HelpTooltip from '../HelpTooltip.svelte';

  import type { KindedOptions } from 'core-cairo';
  import { premintPattern, infoDefaults } from 'core-cairo';

  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilitySection from './UpgradeabilitySection.svelte';
  import InfoSection from './InfoSection.svelte';

  export const opts: Required<KindedOptions['ERC20']> = {
    kind: 'ERC20',
    name: 'MyToken',
    symbol: 'MTK',
    burnable: false,
    snapshots: false,
    pausable: false,
    premint: 0,
    decimals: 18,
    mintable: false,
    permit: false,
    votes: false,
    flashmint: false,
    access: 'ownable',
    upgradeable: false,
    info: { ...infoDefaults },
  };
</script>

<section class="controls-section">
  <h1>Settings</h1>

    <div class="grid grid-cols-[2fr,1fr] gap-2">
      <label class="labeled-input">
        <span>Name</span>
        <input bind:value={opts.name}>
      </label>

      <label class="labeled-input">
        <span>Symbol</span>
        <input bind:value={opts.symbol}>
      </label>

      <label class="labeled-input">
        <span>Decimals</span>
        <input bind:value={opts.decimals} type="number" >
      </label>
    </div>

    <div class="grid grid-cols-[2fr,1fr] gap-2">
      <label class="labeled-input">
        <span class="flex justify-between pr-2">
          Premint
          <HelpTooltip>Create an initial amount of tokens for the recipient.</HelpTooltip>
        </span>
        <input bind:value={opts.premint} type="number" placeholder=0 pattern={premintPattern.source}>
      </label>
  </div>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.mintable}>
      <input type="checkbox" bind:checked={opts.mintable}>
      Mintable
      <HelpTooltip>
        Privileged accounts will be able to create more supply.
      </HelpTooltip>
    </label>

    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable}>
      Burnable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Burnable">
        Token holders will be able to destroy their tokens.
      </HelpTooltip>
    </label>

    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable}>
      Pausable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/utils#Pausable">
        Privileged accounts will be able to pause the functionality marked as <code>whenNotPaused</code>.
        Useful for emergency response.
      </HelpTooltip>
    </label>
  </div>
</section>

<AccessControlSection bind:access={opts.access} />

<UpgradeabilitySection bind:upgradeable={opts.upgradeable} />

<InfoSection bind:info={opts.info} />
