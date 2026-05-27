<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import SolidityApp from '../solidity/App.svelte';
  import type { InitialOptions } from '../common/initial-options';
  import type { Overrides } from '../solidity/overrides';
  import { defineOmitFeatures, sanitizeOmittedFeatures } from './handle-unsupported-features';
  import { createWiz } from '../common/Wiz.svelte';
  // Rewrite ERC20/721/1155/4626 to TRC* and @openzeppelin/contracts to
  // @openzeppelin/tron-contracts for the in-page display + single-file download.
  // The zip generators apply the same transform internally.
  import { rewriteForTron, type Contract, type GenericOptions } from '@openzeppelin/wizard';

  export let initialTab: string | undefined = 'ERC20';
  export let initialOpts: InitialOptions = {};

  const dispatch = createEventDispatcher();

  // Dynamic imports so the TRON-specific code is loaded only when this app mounts.
  const zipHardhatTronModule = import('@openzeppelin/wizard/zip-env-hardhat-tron');
  const zipTronboxModule = import('@openzeppelin/wizard/zip-env-tronbox');

  // Uses the Solidity Wizard with overrides specific to TRON:
  //  - rewrite generated source to TRC token names + @openzeppelin/tron-contracts paths
  //  - swap Hardhat download for the @openzeppelin/hardhat-tron-based one
  //  - replace the second download tab (originally Foundry) with TronBox
  //  - hide upgradeable downloads (tron-contracts upgradeable variants not yet shipped)
  //  - remap @openzeppelin/tron-contracts when opening in Remix (TVM is EVM-compatible enough)
  //  - hide Account tab (ERC-4337 EntryPoint not deployed on TRON in scope here)
  const overrides: Overrides = {
    omitTabs: ['Account'],
    tabLabels: { ERC20: 'TRC20', ERC721: 'TRC721', ERC1155: 'TRC1155' },
    omitFeatures: defineOmitFeatures(),
    omitZipHardhat: (opts?: GenericOptions) => !!opts?.upgradeable,
    overrideZipHardhat: async (c: Contract, opts?: GenericOptions) => {
      const { zipHardhatTron } = await zipHardhatTronModule;
      return zipHardhatTron(c, opts);
    },
    omitZipFoundry: false,
    overrideZipFoundry: async (c: Contract, opts?: GenericOptions) => {
      const { zipTronbox } = await zipTronboxModule;
      return zipTronbox(c, opts);
    },
    secondaryDownloadLabel: {
      title: 'Development Package (TronBox)',
      description: 'Sample TronBox project with migrations and tests, targeting the TRON Virtual Machine.',
    },
    secondaryDownloadAction: 'download-tronbox',
    // Remix supports the TRON contracts source as-is (TVM is EVM-compatible),
    // provided we point its npm resolver at the right package.
    omitOpenInRemix: false,
    overrideVersionedRemappings: () => ['@openzeppelin/tron-contracts/=@openzeppelin/tron-contracts/'],
    transformPrintedContract: rewriteForTron,
    sanitizeOmittedFeatures,
    postConfigLanguage: 'tron-solidity',
    aiAssistant: {
      svelteComponent: createWiz<'tron'>(),
      language: 'tron',
    },
  };
</script>

<div class="tron-app">
  <SolidityApp {initialTab} {initialOpts} {overrides} on:tab-change={event => dispatch('tab-change', event.detail)} />
</div>

<style lang="postcss">
  .tron-app :global(.tab button.selected) {
    background-color: #ff060a !important;
    color: white;
    order: -1;
  }
</style>
