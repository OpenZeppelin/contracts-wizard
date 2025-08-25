<script lang="ts">
  import SolidityApp from '../solidity/App.svelte';
  import type { InitialOptions } from '../common/initial-options';
  import type { Kind } from '@openzeppelin/wizard';
  import type { Overrides } from '../solidity/overrides';

  export let initialTab: string | undefined = 'ERC20';
  export let initialOpts: InitialOptions = {};

  const omitFeatures: Map<Kind, string[]> = new Map();
  omitFeatures.set('ERC20', ['superchain']);
  omitFeatures.set('Stablecoin', ['superchain']);
  omitFeatures.set('RealWorldAsset', ['superchain']);

  let overrides: Overrides = {
    omitTabs: ['Account'],
    omitFeatures,
    omitZipFoundry: true,
    remix: {
      label: 'Open in Polkadot Remix',
      url: 'https://remix.polkadot.io',
    },
  };
</script>

<div class="polkadot-app">
  <!-- TODO: override Wiz, override hardhat -->
  <SolidityApp {initialTab} {initialOpts} {overrides} />
</div>

<style lang="postcss">
  .polkadot-app :global(.tab button.selected) {
    background-color: var(--polkadot-pink) !important;
    color: white;
    order: -1;
  }
</style>
