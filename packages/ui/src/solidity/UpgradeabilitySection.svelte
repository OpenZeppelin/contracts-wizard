<script lang="ts">
  import type { Upgradeable } from '@openzeppelin/wizard';

  import ToggleRadio from '../common/inputs/ToggleRadio.svelte';
  import HelpTooltip from '../common/HelpTooltip.svelte';

  export let upgradeable: Upgradeable;
  let isExpanded = false; // New variable to track expanded state

  // Reactive statement to expand the section when upgradeable is enabled
  $: if (upgradeable !== false) {
    isExpanded = true;
  }
</script>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Upgradeability</span>
      <span class="ml-1">
        <ToggleRadio bind:value={upgradeable} defaultValue="transparent" />
      </span>
      <button on:click={() => isExpanded = !isExpanded} class='mx-2 px-1'>
        {isExpanded ? '▲' : '▼'}
      </button>
      <HelpTooltip align="right" link="https://docs.openzeppelin.com/openzeppelin/upgrades">
      Smart contracts are immutable by default unless deployed behind an upgradeable proxy.
      </HelpTooltip>
    </label>
  </h1>

  {#if isExpanded}
    <div class="checkbox-group">
      <label class:checked={upgradeable === 'transparent'}>
        <input type="radio" bind:group={upgradeable} value="transparent">
        Transparent
        <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/proxy#TransparentUpgradeableProxy">
        Uses more complex proxy with higher overhead, requires less changes in your contract. Can also be used with beacons.
        </HelpTooltip>
      </label>
      <label class:checked={upgradeable === 'uups'}>
        <input type="radio" bind:group={upgradeable} value="uups">
        UUPS
        <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/proxy#UUPSUpgradeable">
        Uses simpler proxy with less overhead, requires including extra code in your contract. Allows flexibility for authorizing upgrades.
        </HelpTooltip>
      </label>
    </div>
  {/if}
</section>