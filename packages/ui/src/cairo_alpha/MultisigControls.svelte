<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';
  import UpgradeabilityField from './UpgradeabilityField.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-cairo';
  import { multisig, infoDefaults } from '@openzeppelin/wizard-cairo';

  import InfoSection from './InfoSection.svelte';
  import { error } from '../common/error-tooltip';

  const defaults = multisig.defaults;

  export const opts: Required<KindedOptions['Multisig']> = {
    kind: 'Multisig',
    ...defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <label class="labeled-input">
    <span>Name</span>
    <input bind:value={opts.name} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Quorum
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/governance/multisig#signer_management">
        The minimal number of confirmations required to approve a transaction.
      </HelpTooltip>
    </span>
    <input bind:value={opts.quorum} placeholder="" use:error={errors?.quorum} />
  </label>
</section>

<section class="controls-section">
  <h1>Features</h1>
  <div class="checkbox-group">
    <UpgradeabilityField bind:upgradeable={opts.upgradeable} />
  </div>
</section>

<InfoSection bind:info={opts.info} />
