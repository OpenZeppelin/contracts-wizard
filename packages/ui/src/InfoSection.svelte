<script lang="ts">
  import type { Info } from '@openzeppelin/wizard';

  import HelpTooltip from './HelpTooltip.svelte';

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
      Security email contact
      <HelpTooltip link="https://github.com/ethereum-lists/contracts/blob/main/README.md">
      If someone finds a vulnerability in your contract, they can use this email to report it to you. You will need to verify your contract metadata for this to be visible.
      </HelpTooltip>
    </span>
    <input bind:value={info.securityContact} placeholder="security@example.com" />
  </label>

  <label class="labeled-input">
    <span>License</span>
    <input bind:value={info.license} />
  </label>
</section>

