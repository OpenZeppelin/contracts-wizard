<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-stellar';
  import { nonFungible, infoDefaults } from '@openzeppelin/wizard-stellar';

  import InfoSection from './InfoSection.svelte';
  import MintableSection from './MintableSection.svelte';
  import { error } from '../common/error-tooltip';

  export let opts: Required<KindedOptions['NonFungible']> = {
    kind: 'NonFungible',
    ...nonFungible.defaults,
    info: { ...infoDefaults },
  };

  export let errors: undefined | OptionsErrorMessages;

  // Handler functions for checkbox changes
  function handleConsecutiveChange(value: boolean) {
    if (value) {
      opts.mintable = false;
      opts.enumerable = false;
    }
    opts.consecutive = value;
  }

  function handleEnumerableChange(value: boolean) {
    if (value) {
      opts.consecutive = false;
    }
    opts.enumerable = value;
  }
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <div class="grid grid-cols-[2fr,1fr] gap-2">
    <label class="labeled-input">
      <span>Name</span>
      <input bind:value={opts.name} use:error={errors?.name} />
    </label>

    <label class="labeled-input">
      <span>Symbol</span>
      <input bind:value={opts.symbol} use:error={errors?.symbol} />
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable} />
      Burnable
      <HelpTooltip>Token holders will be able to destroy their NFTs.</HelpTooltip>
    </label>

    <label class:checked={opts.enumerable} use:error={errors?.enumerable}>
      <input type="checkbox" bind:checked={opts.enumerable} />
      Enumerable
      <HelpTooltip>Enable on-chain enumeration of tokens. Cannot be used with Consecutive extensions.</HelpTooltip>
    </label>

    <label class:checked={opts.consecutive} use:error={errors?.consecutive}>
      <input type="checkbox" bind:checked={opts.consecutive} />
      Consecutive
      <HelpTooltip
        >Use consecutive token IDs instead of unique UUIDs. Incompatible with Enumerable extension.</HelpTooltip
      >
    </label>

    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable} />
      Pausable
      <HelpTooltip>Privileged accounts can pause core functionality.</HelpTooltip>
    </label>
    <label class:checked={opts.upgradeable}>
      <input type="checkbox" bind:checked={opts.upgradeable} />
      Upgradeable
      <HelpTooltip>Allows the contract to be upgraded by the owner.</HelpTooltip>
    </label>
  </div>
</section>

<MintableSection
  bind:mintable={opts.mintable}
  bind:sequential={opts.sequential}
  consecutive={opts.consecutive}
  errors={{
    mintable: errors?.mintable,
    sequential: errors?.sequential,
  }}
/>

<InfoSection bind:info={opts.info} />
