<script lang="ts">
  import type { Upgradeable } from '@openzeppelin/wizard-cairo';

  import HelpTooltip from '../HelpTooltip.svelte';
  import ToggleRadio from '../inputs/ToggleRadio.svelte';

  export let upgradeable: Upgradeable;

  let upgradeableWithKind: 'uups' | false;
  $: upgradeable = upgradeableWithKind === 'uups' ? true : false;
</script>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Upgradeability</span>
      <span class="ml-1">
        <ToggleRadio bind:value={upgradeableWithKind} defaultValue='uups' />
      </span>
      <HelpTooltip align="right" link="https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/Proxies.md">
      Smart contracts are immutable by default unless deployed behind an upgradeable proxy.
      </HelpTooltip>
    </label>
  </h1>

  <div class="checkbox-group">
    <label class:checked={upgradeableWithKind === 'uups'}>
      <input type="radio" bind:group={upgradeableWithKind} value='uups'>
      UUPS
      <HelpTooltip link="https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/Proxies.md#proxy-contract">
      Requires including code in your contract for upgrades. Allows flexibility for authorizing upgrades.
      </HelpTooltip>
    </label>
  </div>
</section>

