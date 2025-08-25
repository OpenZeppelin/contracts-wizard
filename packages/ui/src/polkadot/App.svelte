<script lang="ts">
  import SolidityApp from '../solidity/App.svelte';
  import type { InitialOptions } from '../common/initial-options';
  import type { Kind } from '@openzeppelin/wizard';

  export let initialTab: string | undefined = 'ERC20';
  export let initialOpts: InitialOptions = {};

  let omitTabs: Kind[] = ['Account'];

  let omitFeatures: Map<Kind, string[]> = new Map();
  omitFeatures.set('ERC20', ['superchain']);
  omitFeatures.set('Stablecoin', ['superchain']);
  omitFeatures.set('RealWorldAsset', ['superchain']);
</script>

<div class="polkadot-app">
  <SolidityApp {initialTab} {initialOpts} {omitTabs} {omitFeatures} />
</div>

<style lang="postcss">
  .polkadot-app :global(.tab button.selected) {
    background-color: var(--polkadot-pink) !important;
    color: white;
    order: -1;
  }
</style>
