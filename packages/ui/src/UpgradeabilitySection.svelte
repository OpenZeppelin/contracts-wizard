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
    <label class="flex items-center flex-col-gap-1">
      <span>Upgradeability</span>
      <input type="checkbox" bind:checked={enabled} style="margin-top: var(--icon-adjust)">
    </label>
  </h1>

  <div class="checkbox-group">
    <label class:checked={upgradeable === 'transparent'}>
      <input type="radio" bind:group={upgradeable} value="transparent">
      Transparent
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/proxy#TransparentUpgradeableProxy">
      More complex proxy with higher overhead, requires less changes in your contract.
      </HelpTooltip>
    </label>
    <label class:checked={upgradeable === 'uups'}>
      <input type="radio" bind:group={upgradeable} value="uups">
      UUPS
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable">
      Simpler proxy with less overhead, requires including extra code in your contract. Allows flexibility for authorizing upgrades.
      </HelpTooltip>
    </label>
  </div>
</section>

