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
      Whether the contract functions should be explicitly implemented or be auto-generated with the defaults provided by
      the library.
    </HelpTooltip>
  </h1>
  <div class="checkbox-group">
    <label class:checked={implementationMode === 'default'}>
      <input type="radio" bind:group={implementationMode} value="default" on:change={syncExplicit} />
      Default
      <HelpTooltip
        >The <code>#[contractimpl(contracttrait)]</code> attribute generates the contract functions with the defaults provided
        in the trait. You can re-implement some of the functions with custom logic if needed.</HelpTooltip
      >
    </label>

    <label class:checked={implementationMode === 'explicit'}>
      <input type="radio" bind:group={implementationMode} value="explicit" on:change={syncExplicit} />
      Explicit
      <HelpTooltip
        >Include every trait function body explicitly. Useful when all of them need to be customized.</HelpTooltip
      >
    </label>
  </div>
</section>
