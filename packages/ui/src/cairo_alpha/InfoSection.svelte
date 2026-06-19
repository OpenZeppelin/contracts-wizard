<script lang="ts">
  import type { Info, OptionsErrorMessages } from '@openzeppelin/wizard-cairo-alpha';
  import { infoDefaults } from '@openzeppelin/wizard-cairo-alpha';
  import HelpTooltip from '../common/HelpTooltip.svelte';
  import { error } from '../common/error-tooltip';

  export let info: Info;

  export let errors: OptionsErrorMessages | undefined = undefined;
</script>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Info</span>
    </label>
  </h1>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Security Contact
      <HelpTooltip>
        Where people can contact you to report security issues. Will only be visible if contract metadata is verified.
      </HelpTooltip>
    </span>
    <input bind:value={info.securityContact} placeholder="security@example.com" use:error={errors?.securityContact} />
  </label>

  <label class="labeled-input">
    <span>License</span>
    <input bind:value={info.license} placeholder={infoDefaults.license} use:error={errors?.license} />
  </label>
</section>
