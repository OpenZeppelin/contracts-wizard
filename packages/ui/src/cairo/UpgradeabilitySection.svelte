<script lang="ts">
  import type { Upgradeable } from '@openzeppelin/wizard-cairo';

  import HelpTooltip from '../HelpTooltip.svelte';
  import ToggleRadio from '../inputs/ToggleRadio.svelte';

  export let upgradeable: Upgradeable;
</script>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Upgradeability</span>
      <span class="ml-1">
        <ToggleRadio bind:value={upgradeable} defaultValue={true} />
      </span>
      <HelpTooltip align="right" link="https://docs.openzeppelin.com/contracts-cairo/proxies">
      Smart contracts are immutable by default unless deployed behind an upgradeable proxy.
      </HelpTooltip>
    </label>
  </h1>

  <div class="checkbox-group">
    <label class:checked={upgradeable}>
      <input type="radio" bind:group={upgradeable} value={true}>
      UUPS
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/proxies#proxy_contract">
      Requires including code in your contract for upgrades. Allows flexibility for authorizing upgrades.
      </HelpTooltip>
    </label>
  </div>
</section>

