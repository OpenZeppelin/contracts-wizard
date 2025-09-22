<script lang="ts">
  import SolidityApp from '../solidity/App.svelte';
  import type { InitialOptions } from '../common/initial-options';
  import type { Overrides } from '../solidity/overrides';
  import { defineOmitFeatures, sanitizeOmittedFeatures } from './handle-unsupported-features';
  import { createWiz } from '../common/Wiz.svelte';

  export let initialTab: string | undefined = 'ERC20';
  export let initialOpts: InitialOptions = {};

  /**
   * Uses the Solidity Wizard with overrides specific to Polkadot.
   * See @type Overrides for details.
   */
  const overrides: Overrides = {
    omitTabs: ['Account'],
    omitFeatures: defineOmitFeatures(),
    omitZipFoundry: true,
    omitZipHardhat: true, // Disabled until Polkadot-specific config is added for the download package
    remix: {
      label: 'Open in Polkadot Remix',
      url: 'https://remix.polkadot.io',
    },
    sanitizeOmittedFeatures,
    aiAssistant: {
      svelteComponent: createWiz<'polkadot'>(),
      language: 'polkadot',
    },
  };
</script>

<div class="polkadot-app">
  <SolidityApp {initialTab} {initialOpts} {overrides} />
</div>

<style lang="postcss">
  .polkadot-app :global(.tab button.selected) {
    background-color: var(--polkadot-pink) !important;
    color: white;
    order: -1;
  }
</style>
