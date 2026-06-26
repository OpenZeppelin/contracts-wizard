<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-stellar';
  import { vault, infoDefaults } from '@openzeppelin/wizard-stellar';

  import AccessControlSection from './AccessControlSection.svelte';
  import InfoSection from './InfoSection.svelte';
  import TraitImplementationSection from './TraitImplementationSection.svelte';
  import { error } from '../common/error-tooltip';

  export let opts: Required<KindedOptions['Vault']> = {
    kind: 'Vault',
    ...vault.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = vault.isAccessControlRequired(opts);
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
      Decimals offset
      <HelpTooltip>
        Virtual offset added to the underlying asset's decimals to derive the vault share decimals, mitigating inflation
        (donation) attacks. The default of 0 is already safe (it makes such attacks non-profitable); higher values add
        more margin, at the cost of virtual shares absorbing a tiny part of the vault's accrued value. Must be between 0
        and 10.
      </HelpTooltip>
    </span>
    <input bind:value={opts.decimalsOffset} use:error={errors?.decimalsOffset} />
  </label>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
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

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<TraitImplementationSection bind:explicitImplementations={opts.explicitImplementations} />

<InfoSection bind:info={opts.info} {errors} />
