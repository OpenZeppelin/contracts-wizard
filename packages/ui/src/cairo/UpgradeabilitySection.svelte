<script lang="ts">
  import type { Upgradeable } from '@openzeppelin/wizard-cairo';

  import HelpTooltip from '../HelpTooltip.svelte';

  export let upgradeable: Upgradeable;
</script>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Upgradeability</span>
      <span class="ml-1">
        <input type="checkbox" bind:checked={upgradeable}>
      </span>
      <HelpTooltip align="right" link="https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/Proxies.md#using-proxies">
      Smart contracts are immutable by default unless deployed behind an upgradeable proxy.
      </HelpTooltip>
    </label>
  </h1>
</section>

