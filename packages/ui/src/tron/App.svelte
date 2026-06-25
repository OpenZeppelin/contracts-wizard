<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import SolidityApp from '../solidity/App.svelte';
  import type { InitialOptions } from '../common/initial-options';
  import type { Overrides } from '../solidity/overrides';
  import { defineOmitFeatures, sanitizeOmittedFeatures } from './handle-unsupported-features';
  import { createWiz } from '../common/Wiz.svelte';
  // The TRON library profile renders TRC* token names + @openzeppelin/tron-contracts
  // import paths structurally (via printContract), for the in-page display and
  // single-file download. The zip generators apply the same profile internally.
  import { tronPrintProfile, TRON_DEFAULT_BLOCK_TIME, type Contract, type GenericOptions } from '@openzeppelin/wizard';

  export let initialTab: string | undefined = 'ERC20';
  export let initialOpts: InitialOptions = {};

  const dispatch = createEventDispatcher();

  // Dynamic imports so the TRON-specific code is loaded only when this app mounts.
  const zipHardhatTronModule = import('@openzeppelin/wizard/zip-env-hardhat-tron');
  const zipTronboxModule = import('@openzeppelin/wizard/zip-env-tronbox');

  // Uses the Solidity Wizard with overrides specific to TRON:
  //  - rewrite generated source to TRC token names + @openzeppelin/tron-contracts paths
  //    (incl. @openzeppelin/tron-contracts-upgradeable for upgradeable contracts)
  //  - swap Hardhat download for the @openzeppelin/hardhat-tron-based one
  //  - replace the second download tab (originally Foundry) with TronBox
  //  - remap the @openzeppelin/tron-contracts packages when opening in Remix (TVM is EVM-compatible enough)
  //  - hide Account tab (ERC-4337 EntryPoint not deployed on TRON in scope here)
  //  - hide Stablecoin + RealWorldAsset tabs (they rely on @openzeppelin/community-contracts,
  //    which is not being ported to TRON)
  //
  // Upgradeable contracts are fully supported: the generated source imports from
  // @openzeppelin/tron-contracts-upgradeable, and the Hardhat/TronBox downloads
  // deploy the proxy by hand (the OZ Upgrades plugins don't target TRON).
  const overrides: Overrides = {
    omitTabs: ['Account', 'Stablecoin', 'RealWorldAsset'],
    tabLabels: { ERC20: 'TRC20', ERC721: 'TRC721', ERC1155: 'TRC1155' },
    omitFeatures: defineOmitFeatures(),
    // Both downloads are shown for every option, upgradeable included — the
    // generators emit a manual proxy-deploy project for upgradeable contracts.
    omitZipHardhat: () => false,
    overrideZipHardhat: async (c: Contract, opts?: GenericOptions) => {
      const { zipHardhatTron } = await zipHardhatTronModule;
      return zipHardhatTron(c, opts);
    },
    omitZipFoundry: () => false,
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
    // provided we point its npm resolver at the right packages. List the
    // upgradeable package first so its longer prefix is matched ahead of the base.
    omitOpenInRemix: false,
    overrideVersionedRemappings: () => [
      '@openzeppelin/tron-contracts-upgradeable/=@openzeppelin/tron-contracts-upgradeable/',
      '@openzeppelin/tron-contracts/=@openzeppelin/tron-contracts/',
    ],
    printOptions: tronPrintProfile,
    sanitizeOmittedFeatures,
    postConfigLanguage: 'tron-solidity',
    // TRON SR consensus produces a block every ~3s, so the Governor's
    // "1 block = N seconds" field should default to 3 here instead of
    // inheriting Ethereum's 12.
    defaultBlockTime: TRON_DEFAULT_BLOCK_TIME,
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
    background-color: var(--tron-red) !important;
    color: white;
    order: -1;
  }
</style>
