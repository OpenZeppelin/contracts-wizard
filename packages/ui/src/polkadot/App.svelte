<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import SolidityApp from '../solidity/App.svelte';
  import type { InitialOptions } from '../common/initial-options';
  import type { Overrides } from '../solidity/overrides';
  import { defineOmitFeatures, sanitizeOmittedFeatures } from './handle-unsupported-features';
  import { createWiz } from '../common/Wiz.svelte';
  import type { Contract, GenericOptions } from '@openzeppelin/wizard';

  export let initialTab: string | undefined = 'ERC20';
  export let initialOpts: InitialOptions = {};

  const dispatch = createEventDispatcher();

  // Dynamic import so it only loads when needed
  const zipHardhatPolkadotModule = import('@openzeppelin/wizard/zip-env-hardhat-polkadot');

  /**
   * Uses the Solidity Wizard with overrides specific to Polkadot.
   * See @type Overrides for details.
   */
  const overrides: Overrides = {
    omitTabs: ['Account'],
    omitFeatures: defineOmitFeatures(),
    omitZipFoundry: true,
    omitZipHardhat: (opts?: GenericOptions) => {
      return !!opts?.upgradeable;
    },
    overrideZipHardhat: async (c: Contract, opts?: GenericOptions) => {
      const { zipHardhatPolkadot } = await zipHardhatPolkadotModule;
      return zipHardhatPolkadot(c, opts);
    },
    remix: {
      label: 'Open in Polkadot Remix',
      url: 'https://remix.polkadot.io',
      tooltipMessage:
        '<b>Note:</b> Polkadot Remix may show a compile warning about <code>ecrecover</code> when it is used in some imported contracts. <code>ecrecover</code> works as expected on Polkadot AssetHub despite this warning.',
    },
    sanitizeOmittedFeatures,
    aiAssistant: {
      svelteComponent: createWiz<'polkadot'>(),
      language: 'polkadot',
    },
  };
</script>

<div class="polkadot-app">
  <SolidityApp {initialTab} {initialOpts} {overrides} on:tab-change={event => dispatch('tab-change', event.detail)} />
</div>

<style lang="postcss">
  .polkadot-app :global(.tab button.selected) {
    background-color: var(--polkadot-pink) !important;
    color: white;
    order: -1;
  }
</style>
