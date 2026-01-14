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
      <HelpTooltip>Create an initial amount of tokens for the owner.</HelpTooltip>
    </span>
    <input bind:value={opts.premint} use:error={errors?.premint} placeholder="0" pattern={premintPattern.source} />
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

<InfoSection bind:info={opts.info} />
