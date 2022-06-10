<script lang="ts">
  import HelpTooltip from './HelpTooltip.svelte';

  import type { KindedOptions } from '@openzeppelin/wizard';
  import { premintPattern, infoDefaults } from '@openzeppelin/wizard';

  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilitySection from './UpgradeabilitySection.svelte';
  import InfoSection from './InfoSection.svelte';

  export const opts: Required<KindedOptions['General']> = {
    kind: 'General',
    name: 'MyContract',
    access: 'ownable',
    upgradeable: false,
    info: { ...infoDefaults },
  };
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <label class="labeled-input">
    <span>Name</span>
    <input bind:value={opts.name}>
  </label>
</section>

<AccessControlSection bind:access={opts.access} />

<UpgradeabilitySection bind:upgradeable={opts.upgradeable} />

<InfoSection bind:info={opts.info} />
