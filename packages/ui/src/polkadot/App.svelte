<script lang="ts">
  import SolidityApp from '../solidity/App.svelte';
  import type { InitialOptions } from '../common/initial-options';
  import type { Overrides } from '../solidity/overrides';
  import { defineOmitFeatures, removeOmittedFeatures } from './remove-unsupported-features';

  export let initialTab: string | undefined = 'ERC20';
  export let initialOpts: InitialOptions = {};

  // Governor, permit, and votes are disabled for now, due to requirement on ECDSA.
  // These require further investigation for use with Polkadot's native account abstraction.

  let overrides: Overrides = {
    omitTabs: ['Account', 'Governor'],
    omitFeatures: defineOmitFeatures(),
    omitZipFoundry: true,
    remix: {
      label: 'Open in Polkadot Remix',
      url: 'https://remix.polkadot.io',
    },
    removeOmittedFeatures,
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
