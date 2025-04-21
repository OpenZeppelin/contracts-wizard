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

  $: if (opts.consecutive) {
    opts.minting = false;
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

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Premint
      <HelpTooltip>Generate initial NFTs with given IDs for the owner.</HelpTooltip>
    </span>
    <input bind:value={opts.premint} use:error={errors?.premint} placeholder="0" />
  </label>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable} />
      Burnable
      <HelpTooltip>Token holders will be able to destroy their NFTs.</HelpTooltip>
    </label>

    <label class:checked={opts.enumerable}>
      <input type="checkbox" bind:checked={opts.enumerable} />
      Enumerable
      <HelpTooltip>Enable on-chain enumeration of tokens.</HelpTooltip>
    </label>

    <label class:checked={opts.consecutive}>
      <input type="checkbox" bind:checked={opts.consecutive} />
      Consecutive
      <HelpTooltip>Use consecutive token IDs instead of unique UUIDs.</HelpTooltip>
    </label>

    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable} />
      Pausable
      <HelpTooltip>Privileged accounts can pause core functionality.</HelpTooltip>
    </label>
  </div>
</section>

<MintableSection bind:minting={opts.minting} bind:mintingMode={opts.mintingMode} consecutive={opts.consecutive} />

<InfoSection bind:info={opts.info} />
