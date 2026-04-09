<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-stellar';
  import { nonFungible, infoDefaults } from '@openzeppelin/wizard-stellar';

  import AccessControlSection from './AccessControlSection.svelte';
  import InfoSection from './InfoSection.svelte';
  import MintableSection from './MintableSection.svelte';
  import TraitImplementationSection from './TraitImplementationSection.svelte';
  import { error } from '../common/error-tooltip';

  export let opts: Required<KindedOptions['NonFungible']> = {
    kind: 'NonFungible',
    ...nonFungible.defaults,
    info: { ...infoDefaults },
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = nonFungible.isAccessControlRequired(opts);

  // Handler functions for checkbox changes
  function handleConsecutiveChange(value: boolean) {
    if (value) {
      opts.mintable = false;
      opts.enumerable = false;
      opts.votes = false;
    }
    opts.consecutive = value;
  }

  function handleVotesChange(value: boolean) {
    if (value) {
      opts.enumerable = false;
      opts.consecutive = false;
    }
    opts.votes = value;
  }

  function handleEnumerableChange(value: boolean) {
    if (value) {
      opts.consecutive = false;
      opts.votes = false;
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

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Token URI
      <HelpTooltip>Sets the metadata URI that the contract returns from <code>token_uri</code>.</HelpTooltip>
    </span>
    <input bind:value={opts.tokenUri} placeholder="https://..." use:error={errors?.tokenUri} />
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

    <label class:checked={opts.votes} class:disabled={opts.enumerable || opts.consecutive} use:error={errors?.votes}>
      <input
        type="checkbox"
        checked={opts.votes}
        disabled={opts.enumerable || opts.consecutive}
        on:change={e => handleVotesChange(e.currentTarget.checked)}
      />
      Votes
      <HelpTooltip
        >Adds vote checkpoints and delegation support. Incompatible with Enumerable and Consecutive.</HelpTooltip
      >
    </label>

    <label
      class:checked={opts.enumerable}
      class:disabled={opts.votes || opts.consecutive}
      use:error={errors?.enumerable}
    >
      <input
        type="checkbox"
        checked={opts.enumerable}
        disabled={opts.votes || opts.consecutive}
        on:change={e => handleEnumerableChange(e.currentTarget.checked)}
      />
      Enumerable
      <HelpTooltip>Enable on-chain enumeration of tokens. Cannot be used with Consecutive extensions.</HelpTooltip>
    </label>

    <label
      class:checked={opts.consecutive}
      class:disabled={opts.votes || opts.enumerable}
      use:error={errors?.consecutive}
    >
      <input
        type="checkbox"
        checked={opts.consecutive}
        disabled={opts.votes || opts.enumerable}
        on:change={e => handleConsecutiveChange(e.currentTarget.checked)}
      />
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

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<TraitImplementationSection bind:explicitImplementations={opts.explicitImplementations} />

<InfoSection bind:info={opts.info} />
