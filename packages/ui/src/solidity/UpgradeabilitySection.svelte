<script lang="ts">
  import type { Upgradeable } from '@openzeppelin/wizard';

  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import HelpTooltip from '../common/HelpTooltip.svelte';

  export let upgradeable: Upgradeable;
  export let disabled: boolean = false;
  let defaultValueWhenEnabled: 'transparent' | 'uups' = 'transparent';

  let wasDisabled = disabled;
  let wasUpgradeable = upgradeable;

  $: {
    if (wasDisabled && !disabled) {
      upgradeable = wasUpgradeable;
    } else {
      wasUpgradeable = upgradeable;
      if (upgradeable !== false && disabled) {
        upgradeable = false;
      }
    }

    wasDisabled = disabled;
    if (upgradeable !== false) {
      defaultValueWhenEnabled = upgradeable;
    }
  }
</script>

<ExpandableToggleRadio
  label="Upgradeability"
  bind:value={upgradeable}
  defaultValue="transparent"
  helpContent="Smart contracts are immutable by default unless deployed behind an upgradeable proxy."
  helpLink="https://docs.openzeppelin.com/openzeppelin/upgrades"
  required={disabled}
>
  <div class="text-sm text-gray-500" class:hidden={!disabled}>  <span class="italic">Upgradeability is not currently supported with Cross-Chain Bridging.</span></div>
  <div class="checkbox-group">
    <label class:checked={upgradeable === 'transparent'}>
      <input type="radio" bind:group={upgradeable} value="transparent" disabled={disabled}>
      Transparent
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/proxy#TransparentUpgradeableProxy">
        Uses more complex proxy with higher overhead, requires less changes in your contract. Can also be used with beacons.
      </HelpTooltip>
    </label>
    <label class:checked={upgradeable === 'uups'}>
      <input type="radio" bind:group={upgradeable} value="uups" disabled={disabled}>
      UUPS
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/proxy#UUPSUpgradeable">
        Uses simpler proxy with less overhead, requires including extra code in your contract. Allows flexibility for authorizing upgrades.
      </HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>