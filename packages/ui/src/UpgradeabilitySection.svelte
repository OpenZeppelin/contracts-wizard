<script lang="ts">
  import type { Upgradeable } from '@openzeppelin/wizard';

  import HelpTooltip from './HelpTooltip.svelte';

  export let upgradeable: Upgradeable;

  let enabled = upgradeable !== false;
  let wasEnabled = enabled;
  let wasKind = upgradeable || 'transparent';

  $: {
    if (!wasEnabled) {
      if (enabled) {
        upgradeable = wasKind;
      } else if (upgradeable !== false) {
        enabled = true;
      }
    } else if (!enabled) {
      upgradeable = false;
    }

    wasEnabled = enabled;
    wasKind = upgradeable || wasKind;
  }
</script>

<section class="controls-section">
  <h1>
    <label class="flex items-center tooltip-container pr-2">
      <span>Upgradeability</span>
      <input type="checkbox" bind:checked={enabled} class="ml-1" style="margin-top: var(--icon-adjust)">
      <HelpTooltip align="right" link="https://docs.openzeppelin.com/openzeppelin/upgrades">
      Smart contracts are immutable by default unless deployed behind an upgradeable proxy.
      </HelpTooltip>
    </label>
  </h1>

  <div class="checkbox-group">
    <label class:checked={upgradeable === 'transparent'}>
      <input type="radio" bind:group={upgradeable} value="transparent">
      Transparent
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/proxy#TransparentUpgradeableProxy">
      Uses more complex proxy with higher overhead, requires less changes in your contract.
      </HelpTooltip>
    </label>
    <label class:checked={upgradeable === 'uups'}>
      <input type="radio" bind:group={upgradeable} value="uups">
      UUPS
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable">
      Uses simpler proxy with less overhead, requires including extra code in your contract. Allows flexibility for authorizing upgrades.
      </HelpTooltip>
    </label>
  </div>
</section>

