<script lang="ts">
  import type { Info } from '@openzeppelin/wizard-stellar';
  import { infoDefaults } from '@openzeppelin/wizard-stellar';
  import HelpTooltip from '../common/HelpTooltip.svelte';

  export let info: Info;
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
    <input bind:value={info.securityContact} placeholder="security@example.com" />
  </label>

  <label class="labeled-input">
    <span>License</span>
    <input bind:value={info.license} placeholder={infoDefaults.license} />
  </label>
</section>
