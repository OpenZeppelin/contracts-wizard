<script lang="ts">
  import type { Info } from '@openzeppelin/wizard-cairo';
  import { infoDefaults } from '@openzeppelin/wizard-cairo';

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
    <span>License</span>
    <input bind:value={info.license} placeholder={infoDefaults.license} />
  </label>
</section>

