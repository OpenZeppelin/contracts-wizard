<script lang="ts">
  import HelpTooltip from './HelpTooltip.svelte';

  import type { KindedOptions } from '@openzeppelin/wizard';

  import AccessControlSection from './AccessControlSection.svelte';
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
    info: { license: 'MIT '},
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
    <span class="flex justify-between pr-2">
      Base URI
      <HelpTooltip>Will be concatenated with token IDs to generate the token URIs.</HelpTooltip>
    </span>
    <input bind:value={opts.baseUri} placeholder="https://...">
  </label>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.mintable}>
      <input type="checkbox" bind:checked={opts.mintable}>
      Mintable
      <HelpTooltip>
        Privileged accounts will be able to emit new tokens.
      </HelpTooltip>
    </label>
    <label class:checked={opts.incremental} class="subcontrol">
      <input type="checkbox" bind:checked={opts.incremental}>
      Auto Increment Ids
      <HelpTooltip>
        New tokens will be automatically assigned an incremental id.
      </HelpTooltip>
    </label>
    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable}>
      Burnable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721Burnable">
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
    <label class:checked={opts.enumerable}>
      <input type="checkbox" bind:checked={opts.enumerable}>
      Enumerable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721Enumerable">
        Allows on-chain enumeration of all tokens or those owned by an account. Increases gas cost of transfers.
      </HelpTooltip>
    </label>
    <label class:checked={opts.uriStorage}>
      <input type="checkbox" bind:checked={opts.uriStorage}>
      URI Storage
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721URIStorage">
        Allows updating token URIs for individual token IDs.
      </HelpTooltip>
    </label>
  </div>
</section>

<AccessControlSection bind:access={opts.access} />

<UpgradeabilitySection bind:upgradeable={opts.upgradeable} />

<InfoSection bind:info={opts.info} />