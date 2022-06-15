<script lang="ts">
  import HelpTooltip from './HelpTooltip.svelte';

  import type { KindedOptions } from '@openzeppelin/wizard';
  import { general, infoDefaults } from '@openzeppelin/wizard';

  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilitySection from './UpgradeabilitySection.svelte';
  import InfoSection from './InfoSection.svelte';

  export const opts: Required<KindedOptions['General']> = {
    kind: 'General',
    name: 'MyContract',
    pausable: false,
    access: false,
    upgradeable: false,
    info: { ...infoDefaults },
  };

  let requireAccessControl: boolean;
  $: {
    requireAccessControl = general.isAccessControlRequired(opts);
  }
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <label class="labeled-input">
    <span>Name</span>
    <input bind:value={opts.name}>
  </label>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable}>
      Pausable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/security#Pausable">
        Privileged accounts will be able to pause the functionality marked as <code>whenNotPaused</code>.
        Useful for emergency response.
      </HelpTooltip>
    </label>
  </div>
</section>

<AccessControlSection bind:access={opts.access} requireAccessControl={requireAccessControl} />

<UpgradeabilitySection bind:upgradeable={opts.upgradeable} />

<InfoSection bind:info={opts.info} />
