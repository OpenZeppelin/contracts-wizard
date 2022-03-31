<script lang="ts">
  import HelpTooltip from '../HelpTooltip.svelte';

  import type { KindedOptions } from 'core-cairo';
  import { infoDefaults } from 'core-cairo';
  
  import UpgradeabilitySection from './UpgradeabilitySection.svelte';
  import InfoSection from './InfoSection.svelte';
  

  export const opts: Required<KindedOptions['ERC721']> = {
    kind: 'ERC721',
    name: 'MyToken',
    symbol: 'MTK',
    baseUri: '',
    enumerable: false,
    uriStorage: false,
    burnable: false,
    pausable: false,
    mintable: false,
    incremental: false,
    access: 'ownable',
    upgradeable: false,
    info: { ...infoDefaults },
  };

  let wasMintable = opts.mintable;
  let wasIncremental = opts.incremental;

  $: {
    if (wasMintable && !opts.mintable) {
      opts.incremental = false;
    }

    if (opts.incremental && !wasIncremental) {
      opts.mintable = true;
    }

    wasMintable = opts.mintable;
    wasIncremental = opts.incremental;
  }
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <div class="grid grid-cols-1 gap-2">
    <label class="labeled-input col-span-2">
      <span>Name</span>
      <input bind:value={opts.name}>
    </label>
    <label class="labeled-input">
      <span>Symbol</span>
      <input bind:value={opts.symbol}>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.mintable}>
      <input type="checkbox" bind:checked={opts.mintable}>
      Mintable
      <HelpTooltip link="https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/ERC721.md#presets">
        Privileged accounts will be able to emit new tokens.
      </HelpTooltip>
    </label>
    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable}>
      Burnable
      <HelpTooltip link="https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/ERC721.md#presets">
        Token holders will be able to destroy their tokens.
      </HelpTooltip>
    </label>
    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable}>
      Pausable
      <HelpTooltip link="https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/ERC721.md#presets">
        Privileged accounts will be able to pause the functionality marked as <code>when_not_paused</code>.
        Useful for emergency response.
      </HelpTooltip>
    </label>
    <label class:checked={opts.uriStorage}>
      <input type="checkbox" bind:checked={opts.uriStorage}>
      URI Storage
      <HelpTooltip link="https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/ERC721.md#interpreting-erc721-uris">
        Allows updating token URIs for individual token IDs.
      </HelpTooltip>
    </label>
  </div>
</section>

<UpgradeabilitySection bind:upgradeable={opts.upgradeable} />

<InfoSection bind:info={opts.info} />
