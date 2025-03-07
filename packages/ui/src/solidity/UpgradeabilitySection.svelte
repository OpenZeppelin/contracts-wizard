<script lang="ts">
  import type { Upgradeable } from '@openzeppelin/wizard';

  import HelpTooltip from '../common/HelpTooltip.svelte';
  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';

  export let upgradeable: Upgradeable;
</script>

<ExpandableToggleRadio
  label="Upgradeability"
  bind:value={upgradeable}
  defaultValue="transparent"
  helpContent="Smart contracts are immutable by default unless deployed behind an upgradeable proxy."
  helpLink="https://docs.openzeppelin.com/openzeppelin/upgrades"
>
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
</ExpandableToggleRadio>