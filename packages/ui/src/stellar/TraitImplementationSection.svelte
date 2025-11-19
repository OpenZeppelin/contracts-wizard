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
  <h1>Trait Implementations</h1>
  <p class="explain">
    Whether the contract should use explicit trait implementations instead of the #[default_impl] macro to auto-generate
    trait method bodies.
  </p>
  <div class="checkbox-group">
    <label class:checked={implementationMode === 'default'}>
      <input type="radio" bind:group={implementationMode} value="default" on:change={syncExplicit} />
      Default implementation
      <HelpTooltip
        >Keep the <code>#[default_impl]</code> attribute so unused trait functions rely on the macro.</HelpTooltip
      >
    </label>

    <label class:checked={implementationMode === 'explicit'}>
      <input type="radio" bind:group={implementationMode} value="explicit" on:change={syncExplicit} />
      Explicit trait methods
      <HelpTooltip
        >Generate every trait function body explicitly and omit the <code>#[default_impl]</code> attribute. Easier to customize.</HelpTooltip
      >
    </label>
  </div>
</section>

<style>
  .explain {
    font-size: small;
  }
</style>
