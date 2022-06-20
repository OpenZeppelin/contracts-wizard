<script lang="ts">
  import HelpTooltip from '../HelpTooltip.svelte';

  import type { KindedOptions } from '@openzeppelin/wizard-cairo';
  import { erc721, infoDefaults } from '@openzeppelin/wizard-cairo';
  
  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilitySection from './UpgradeabilitySection.svelte';
  import InfoSection from './InfoSection.svelte';
  
  export const opts: Required<KindedOptions['ERC721']> = {
    kind: 'ERC721',
    ...erc721.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  let requireAccessControl: boolean;
  $: {
    requireAccessControl = erc721.isAccessControlRequired(opts);
  }
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
      <HelpTooltip link="https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/Security.md#pausable">
        Privileged accounts will be able to pause the functionality marked with <code>assert_not_paused</code>.
        Useful for emergency response.
      </HelpTooltip>
    </label>
  </div>
</section>

<AccessControlSection bind:access={opts.access} requireAccessControl={requireAccessControl} />

<UpgradeabilitySection bind:upgradeable={opts.upgradeable} />

<InfoSection bind:info={opts.info} />
