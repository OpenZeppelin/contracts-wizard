<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  type ImplementationMode = 'default' | 'explicit';

  export let explicitImplementations: boolean;

  let implementationMode: ImplementationMode = explicitImplementations ? 'explicit' : 'default';

  $: explicitImplementations = implementationMode === 'explicit';
</script>

<section class="controls-section">
  <h1>Trait Implementations</h1>
  <p>
    Show explicit traits to override specific functions with custom behavior instead of relying on #[default_impl] macro
    that auto-generates stub bodies for every function in the trait that you do not explicitly implement inside that
    impl block
  </p>
  <div class="checkbox-group">
    <label class:checked={implementationMode === 'default'}>
      <input type="radio" bind:group={implementationMode} value="default" />
      Default implementation
      <HelpTooltip
        >Keep the <code>#[default_impl]</code> attribute so unused trait functions rely on the macro.</HelpTooltip
      >
    </label>

    <label class:checked={implementationMode === 'explicit'}>
      <input type="radio" bind:group={implementationMode} value="explicit" />
      Explicit trait methods
      <HelpTooltip
        >Generate every trait function body explicitly and omit the <code>#[default_impl]</code> attribute.</HelpTooltip
      >
    </label>
  </div>
</section>
