<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-stylus';
  import { erc1155, infoDefaults } from '@openzeppelin/wizard-stylus';

  // import AccessControlSection from './AccessControlSection.svelte';
  import InfoSection from './InfoSection.svelte';
  import { error } from '../common/error-tooltip';

  export const opts: Required<KindedOptions['ERC1155']> = {
    kind: 'ERC1155',
    ...erc1155.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = erc1155.isAccessControlRequired(opts);
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <div class="grid gap-2">
    <label class="labeled-input">
      <span>Name</span>
      <input bind:value={opts.name} use:error={errors?.name}>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable}>
      Burnable
      <HelpTooltip>
        Token holders will be able to destroy their tokens.
      </HelpTooltip>
    </label>

    <!-- <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable}>
      Pausable
      <HelpTooltip>
        Privileged accounts will be able to pause the functionality marked with <code>when_not_paused</code>.
        Useful for emergency response.
      </HelpTooltip>
    </label> -->
  </div>
</section>

<!-- TODO: uncomment once Stylus constructors are supported -->
<!-- <AccessControlSection bind:access={opts.access} required={requireAccessControl} /> -->

<InfoSection bind:info={opts.info} />
