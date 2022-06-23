<script lang="ts">
  import type { Upgradeable } from '@openzeppelin/wizard-cairo';

  import HelpTooltip from '../HelpTooltip.svelte';

  export let upgradeable: Upgradeable;

  // Syncs UUPS radio button with Upgradeability checkbox
  let proxyKind: false | 'uups';
  $: {
    proxyKind = upgradeable ? 'uups' : false;
  }

  function enableUpgradability() {
    upgradeable = true;
  }
</script>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Upgradeability</span>
      <span class="ml-1">
        <input type="checkbox" bind:checked={upgradeable}>
      </span>
      <HelpTooltip align="right" link="https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/Proxies.md">
      Smart contracts are immutable by default unless deployed behind an upgradeable proxy.
      </HelpTooltip>
    </label>
  </h1>

  <div class="checkbox-group">
    <label class:checked={upgradeable === true}>
      <input type="radio" bind:group={proxyKind} value='uups' on:change={enableUpgradability}>
      UUPS
      <HelpTooltip link="https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/Proxies.md#proxy-contract">
      Requires including code in your contract for upgrades. Allows flexibility for authorizing upgrades.
      </HelpTooltip>
    </label>
  </div>
</section>

