<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-cairo-alpha';
  import { erc6909, infoDefaults, macrosDefaults } from '@openzeppelin/wizard-cairo-alpha';

  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilityField from './UpgradeabilityField.svelte';
  import InfoSection from './InfoSection.svelte';
  import MacrosSection from './MacrosSection.svelte';
  import { error } from '../common/error-tooltip';

  export let opts: Required<KindedOptions['ERC6909']> = {
    kind: 'ERC6909',
    ...erc6909.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
    macros: { ...macrosDefaults }, // create new object since MacrosOptions is nested
    access: { ...erc6909.defaults.access }, // create new object since Access is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = erc6909.isAccessControlRequired(opts);
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
  bind:darMaxTransferDelay={opts.access.darMaxTransferDelay}
  required={requireAccessControl}
  {errors}
/>

<MacrosSection bind:macros={opts.macros} />

<InfoSection bind:info={opts.info} />
