<script lang="ts">
  import type { MacrosOptions } from '@openzeppelin/wizard-cairo';
  import HelpTooltip from '../common/HelpTooltip.svelte';

  export let macros: MacrosOptions;
</script>

<section class="controls-section">
  <h1>
    <div class="items-center tooltip-container pr-2 flex justify-between">
      <span>Macros</span>
      <HelpTooltip>
        In order to compile Cairo contracts with macros enabled, you need to have the Rust toolchain installed and <code
          >openzeppelin_macros</code
        > package added as a dependency.
      </HelpTooltip>
    </div>
  </h1>

  <div class="checkbox-group">
    <label class:checked={macros.withComponents}>
      <input type="checkbox" bind:checked={macros.withComponents} />
      with_components
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/3.x/macros/with_components">
        Use the <code>with_components</code> macro for simplified contract structure.
      </HelpTooltip>
    </label>
  </div>
</section>
