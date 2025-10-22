<script lang="ts">
  import type { MacrosOptions } from '@openzeppelin/wizard-cairo-alpha';
  import HelpTooltip from '../common/HelpTooltip.svelte';

  export let macros: MacrosOptions;
</script>

<section class="controls-section">
  <h1>Macros</h1>

  <div class="checkbox-group">
    <label class:checked={macros.withComponents}>
      <input type="checkbox" bind:checked={macros.withComponents} />
      with_components
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/alpha/macros/with_components">
        Use the "with_components" macro for simplified contract structure.
      </HelpTooltip>
    </label>
  </div>
</section>
