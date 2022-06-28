<script lang="ts">
  import HelpTooltip from '../HelpTooltip.svelte';

  import type { KindedOptions } from '@openzeppelin/wizard-cairo';
  import { custom, infoDefaults } from '@openzeppelin/wizard-cairo';

  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilitySection from './UpgradeabilitySection.svelte';
  import InfoSection from './InfoSection.svelte';

  export const opts: Required<KindedOptions['Custom']> = {
    kind: 'Custom',
    ...custom.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  let requireAccessControl: boolean;
  $: {
    requireAccessControl = custom.isAccessControlRequired(opts);
  }
</script>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
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