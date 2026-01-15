<script lang="ts">
  import type { Upgradeable, OptionsErrorMessages } from '@openzeppelin/wizard';

  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import HelpTooltip from '../common/HelpTooltip.svelte';
  import { error } from '../common/error-tooltip';

  export let upgradeable: Upgradeable;
  export let disabled: boolean = false;
  export let disabledReason: string | undefined = undefined;

  export let namespaceRequired: boolean = false;
  export let namespacePrefix: string | undefined = undefined;

  export let errors: undefined | OptionsErrorMessages = undefined;

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
  {disabled}
  {disabledReason}
  defaultValue="transparent"
  helpContent="Smart contracts are immutable by default unless deployed behind an upgradeable proxy."
  helpLink="https://docs.openzeppelin.com/openzeppelin/upgrades"
>
  <div class="checkbox-group">
    <label class:checked={upgradeable === 'transparent'}>
      <input type="radio" bind:group={upgradeable} value="transparent" {disabled} />
      Transparent
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/proxy#TransparentUpgradeableProxy">
        Uses more complex proxy with higher overhead, requires less changes in your contract. Can also be used with
        beacons.
      </HelpTooltip>
    </label>
    <label class:checked={upgradeable === 'uups'}>
      <input type="radio" bind:group={upgradeable} value="uups" {disabled} />
      UUPS
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/proxy#UUPSUpgradeable">
        Uses simpler proxy with less overhead, requires including extra code in your contract. Allows flexibility for
        authorizing upgrades.
      </HelpTooltip>
    </label>
  </div>

  {#if namespaceRequired}
    <div style="height: 0.5rem;"></div>

    <label class="labeled-input">
      <span class="flex justify-between pr-2">
        Namespace Prefix
        <HelpTooltip
          link="https://docs.openzeppelin.com/upgrades-plugins/writing-upgradeable#namespaced-storage-layout"
        >
          Prefix for ERC-7201 namespace identifiers. Should be derived from your project name or a unique naming
          convention specific to your project.
        </HelpTooltip>
      </span>
      <input bind:value={namespacePrefix} use:error={errors?.namespacePrefix} />
    </label>
  {/if}
</ExpandableToggleRadio>
