<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  type ImplementationMode = 'default' | 'explicit';

  export let explicitImplementations: boolean = false;

  let implementationMode: ImplementationMode;

  $: implementationMode = explicitImplementations ? 'explicit' : 'default';

  function syncExplicit() {
    explicitImplementations = implementationMode === 'explicit';
  }
</script>

<section class="controls-section">
  <h1 class="flex justify-between pr-2">
    Trait Implementations
    <HelpTooltip>
      Whether the contract should use explicit trait implementations instead of the <code>#[default_impl]</code> macro to
      auto-generate trait method bodies.
    </HelpTooltip>
  </h1>
  <div class="checkbox-group">
    <label class:checked={implementationMode === 'default'}>
      <input type="radio" bind:group={implementationMode} value="default" on:change={syncExplicit} />
      Default
      <HelpTooltip
        >Keep the <code>#[default_impl]</code> attribute so unused trait functions rely on the macro.</HelpTooltip
      >
    </label>

    <label class:checked={implementationMode === 'explicit'}>
      <input type="radio" bind:group={implementationMode} value="explicit" on:change={syncExplicit} />
      Explicit
      <HelpTooltip
        >Generate every trait function body explicitly and omit the <code>#[default_impl]</code> attribute. Easier to customize.</HelpTooltip
      >
    </label>
  </div>
</section>
