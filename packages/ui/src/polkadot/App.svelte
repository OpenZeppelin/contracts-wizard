<script lang="ts">
  import SolidityApp from '../solidity/App.svelte';
  import type { InitialOptions } from '../common/initial-options';
  import type { Overrides } from '../solidity/overrides';
  import { defineOmitFeatures, sanitizeOmittedFeatures } from './handle-unsupported-features';
  import { createWiz } from '../common/Wiz.svelte';

  export let initialTab: string | undefined = 'ERC20';
  export let initialOpts: InitialOptions = {};

  let overrides: Overrides = {
    omitTabs: ['Account'],
    omitFeatures: defineOmitFeatures(),
    omitZipFoundry: true,
    remix: {
      label: 'Open in Polkadot Remix',
      url: 'https://remix.polkadot.io',
    },
    sanitizeOmittedFeatures,
    aiAssistant: {
      svelteComponent: createWiz<'polkadot'>(),
      language: 'polkadot',
      sampleMessages: ['Make a token with supply of 10 million', 'What does mintable do?'],
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
