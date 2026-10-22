<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-stellar';
  import { premintPattern, stablecoin, infoDefaults } from '@openzeppelin/wizard-stellar';

  import AccessControlSection from './AccessControlSection.svelte';
  import InfoSection from './InfoSection.svelte';
  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import TraitImplementationSection from './TraitImplementationSection.svelte';
  import { error } from '../common/error-tooltip';

  export let opts: Required<KindedOptions['Stablecoin']> = {
    kind: 'Stablecoin',
    ...stablecoin.defaults,
    premint: '', // default to empty premint in UI instead of 0
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = stablecoin.isAccessControlRequired(opts);

  // The cap is checked against the total supply, so Total Supply is turned on while a cap is set, and the
  // earlier choice is restored when the cap is cleared.
  let wasCapped = !!opts.cap;
  let totalSupplyBeforeCap = opts.totalSupply;
  $: {
    const isCapped = !!opts.cap;
    if (isCapped && !wasCapped) {
      totalSupplyBeforeCap = opts.totalSupply;
    } else if (!isCapped && wasCapped) {
      opts.totalSupply = totalSupplyBeforeCap;
    }
    if (isCapped && !opts.totalSupply) {
      opts.totalSupply = true;
    }
    wasCapped = isCapped;
  }
  $: capped = !!opts.cap;

  // Votes conflicts with Total Supply and Cap. Each side is disabled while only the other is selected, but both stay
  // enabled once both are selected (e.g. by the AI assistant), so the conflict can be resolved from the controls.
  $: votesDisabled = opts.totalSupply && !opts.votes;
  $: totalSupplyDisabled = capped || (opts.votes && !opts.totalSupply);
  $: capDisabled = opts.votes && !capped;
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
      Decimals
      <HelpTooltip>The number of decimals used to represent token amounts. Defaults to 7.</HelpTooltip>
    </span>
    <input bind:value={opts.decimals} use:error={errors?.decimals} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Premint
      <HelpTooltip>Create an initial amount of tokens for the owner.</HelpTooltip>
    </span>
    <input bind:value={opts.premint} use:error={errors?.premint} placeholder="0" pattern={premintPattern.source} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Cap
      <HelpTooltip>
        Maximum total supply of the token. Leave empty for an uncapped token. Requires Total Supply. Incompatible with
        Votes.
      </HelpTooltip>
    </span>
    <input
      bind:value={opts.cap}
      use:error={errors?.cap}
      placeholder="No cap"
      pattern={premintPattern.source}
      disabled={capDisabled}
    />
  </label>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.mintable}>
      <input type="checkbox" bind:checked={opts.mintable} />
      Mintable
      <HelpTooltip>Privileged accounts will be able to create more supply.</HelpTooltip>
    </label>

    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable} />
      Burnable
      <HelpTooltip>Token holders will be able to destroy their tokens.</HelpTooltip>
    </label>

    <label class:checked={opts.totalSupply} class:disabled={totalSupplyDisabled} use:error={errors?.totalSupply}>
      <input type="checkbox" bind:checked={opts.totalSupply} disabled={totalSupplyDisabled} />
      Total Supply
      <HelpTooltip>
        Tracks the amount of tokens in circulation and exposes it through <code>total_supply</code>. Every mint and burn
        then writes the same storage entry, so they cannot execute in parallel. Required by Cap. Incompatible with
        Votes.
      </HelpTooltip>
    </label>

    <label class:checked={opts.votes} class:disabled={votesDisabled} use:error={errors?.votes}>
      <input type="checkbox" bind:checked={opts.votes} disabled={votesDisabled} />
      Votes
      <HelpTooltip>Adds vote checkpoints and delegation support. Incompatible with Total Supply and Cap.</HelpTooltip>
    </label>

    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable} />
      Pausable
      <HelpTooltip>
        Privileged accounts will be able to pause the functionality marked with <code>when_not_paused</code>. Useful for
        emergency response.
      </HelpTooltip>
    </label>
    <label class:checked={opts.upgradeable}>
      <input type="checkbox" bind:checked={opts.upgradeable} />
      Upgradeable
      <HelpTooltip>Allows the contract to be upgraded by the owner.</HelpTooltip>
    </label>
  </div>
</section>

<ExpandableToggleRadio
  label="Limitations"
  bind:value={opts.limitations}
  defaultValue="allowlist"
  helpContent="Restricts certain users from transferring tokens, either via allowing or blocking them."
>
  <div class="checkbox-group">
    <label class:checked={opts.limitations === 'allowlist'}>
      <input type="radio" bind:group={opts.limitations} value="allowlist" />
      Allowlist
      <HelpTooltip>Allows a list of addresses to transfer tokens.</HelpTooltip>
    </label>
    <label class:checked={opts.limitations === 'blocklist'}>
      <input type="radio" bind:group={opts.limitations} value="blocklist" />
      Blocklist
      <HelpTooltip>Blocks a list of addresses from transferring tokens.</HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<TraitImplementationSection bind:explicitImplementations={opts.explicitImplementations} />

<InfoSection bind:info={opts.info} {errors} />
