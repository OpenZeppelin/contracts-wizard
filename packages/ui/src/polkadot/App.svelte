<script lang="ts">
  import SolidityApp from '../solidity/App.svelte';
  import type { InitialOptions } from '../common/initial-options';
  import type { Kind } from '@openzeppelin/wizard';
  import type { Overrides } from '../solidity/overrides';

  export let initialTab: string | undefined = 'ERC20';
  export let initialOpts: InitialOptions = {};

  // Governor, permit, and votes are disabled for now, due to requirement on ECDSA.
  // These require further investigation for use with Polkadot's native account abstraction.

  const omitFeatures: Map<Kind, string[]> = new Map();
  omitFeatures.set('ERC20', ['superchain', 'permit', 'votes']);
  omitFeatures.set('ERC721', ['votes']);
  omitFeatures.set('Stablecoin', ['superchain', 'permit', 'votes']);
  omitFeatures.set('RealWorldAsset', ['superchain', 'permit', 'votes']);

  let overrides: Overrides = {
    omitTabs: ['Account', 'Governor'],
    omitFeatures,
    omitZipFoundry: true,
    remix: {
      label: 'Open in Polkadot Remix',
      url: 'https://remix.polkadot.io',
    },
  };
</script>

<div class="polkadot-app">
  <!-- TODO: override available options and contracts for Wiz, override hardhat, override default options (e.g. no permit) -->
  <SolidityApp {initialTab} {initialOpts} {overrides} />
</div>

<style lang="postcss">
  .polkadot-app :global(.tab button.selected) {
    background-color: var(--polkadot-pink) !important;
    color: white;
    order: -1;
  }
</style>
