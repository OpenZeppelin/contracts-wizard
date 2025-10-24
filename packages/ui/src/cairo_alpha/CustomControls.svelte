<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-cairo-alpha';
  import { custom, infoDefaults } from '@openzeppelin/wizard-cairo-alpha';

  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilityField from './UpgradeabilityField.svelte';
  import InfoSection from './InfoSection.svelte';
  import { error } from '../common/error-tooltip';

  export let opts: Required<KindedOptions['Custom']> = {
    kind: 'Custom',
    ...custom.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
    access: { ...custom.defaults.access }, // create new object since Access is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = custom.isAccessControlRequired(opts);
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <label class="labeled-input">
    <span>Name</span>
    <input bind:value={opts.name} use:error={errors?.name} />
  </label>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable} />
      Pausable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/alpha/security#pausable">
        Privileged accounts will be able to pause the functionality marked with <code
          >self.pausable.assert_not_paused()</code
        >. Useful for emergency response.
      </HelpTooltip>
    </label>

    <UpgradeabilityField bind:upgradeable={opts.upgradeable} />
  </div>
</section>

<AccessControlSection
  bind:accessType={opts.access.type}
  bind:darInitialDelay={opts.access.darInitialDelay}
  bind:darDefaultDelayIncrease={opts.access.darDefaultDelayIncrease}
  required={requireAccessControl}
  {errors}
/>

<InfoSection bind:info={opts.info} />
