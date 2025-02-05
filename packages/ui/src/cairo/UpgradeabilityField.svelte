<script lang="ts">
  import type { Upgradeable } from '@openzeppelin/wizard-cairo';

  import HelpTooltip from '../common/HelpTooltip.svelte';

  export let upgradeable: Upgradeable;
</script>

<label class:checked={upgradeable}>
  <input type="checkbox" bind:checked={upgradeable}>
  Upgradeable
  <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/upgrades">
    Smart contracts are immutable by default unless they include code that allows them to be upgraded.
  </HelpTooltip>
</label>
