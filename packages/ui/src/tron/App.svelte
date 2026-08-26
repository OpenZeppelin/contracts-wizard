<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import SolidityApp from '../solidity/App.svelte';
  import type { InitialOptions } from '../common/initial-options';
  import type { Overrides } from '../solidity/overrides';
  import { defineOmitFeatures, sanitizeOmittedFeatures } from './handle-unsupported-features';
  import { createWiz } from '../common/Wiz.svelte';
  import { containsNonAscii, tronIdeURL } from '../solidity/tron-ide';
  import TronIcon from '../common/icons/TronIcon.svelte';
  import {
    tronPrintProfile,
    TRON_CONTRACTS_VERSION,
    TRON_DEFAULT_BLOCK_TIME,
    type Contract,
    type GenericOptions,
  } from '@openzeppelin/wizard';

  export let initialTab: string | undefined = 'ERC20';
  export let initialOpts: InitialOptions = {};

  const dispatch = createEventDispatcher();

  // Dynamic imports so the TRON-specific code is loaded only when this app mounts.
  const zipHardhatTronModule = import('@openzeppelin/wizard/zip-env-hardhat-tron');
  const zipTronboxModule = import('@openzeppelin/wizard/zip-env-tronbox');

  // Uses the Solidity Wizard with overrides specific to TRON:
  //  - print via tronPrintProfile (`transformName` / `transformImport` on library
  //    symbols and paths only — not a pass over the finished source)
  //  - swap Hardhat download for the @openzeppelin/hardhat-tron-based one
  //  - replace the second download tab (originally Foundry) with TronBox
  //  - retarget "Open in Remix" to TRON IDE (tronide.io, a Remix fork with TRON deployment)
  //  - hide Account tab (ERC-4337 EntryPoint not deployed on TRON in scope here)
  //  - hide Stablecoin + RealWorldAsset tabs (they rely on @openzeppelin/community-contracts,
  //    which is not being ported to TRON)
  //
  // Upgradeable is fully supported: source imports @openzeppelin/tron-contracts-upgradeable,
  // and both downloads deploy through OpenZeppelin's TRON upgrades plugins.
  const overrides: Overrides = {
    omitTabs: ['Account', 'Stablecoin', 'RealWorldAsset'],
    tabLabels: { ERC20: 'TRC20', ERC721: 'TRC721', ERC1155: 'TRC1155' },
    omitFeatures: defineOmitFeatures(),
    // Both downloads are shown for every option, upgradeable included.
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
    // TRON IDE loads the source as-is. List the upgradeable package first so
    // its longer prefix is matched ahead of the base. TRON IDE ignores the
    // remaps param today (imports resolve through npm's `latest` tag); the
    // versioned form makes existing links pin the library the day it adopts
    // Remix's param.
    omitOpenInRemix: false,
    overrideVersionedRemappings: () => [
      `@openzeppelin/tron-contracts-upgradeable/=@openzeppelin/tron-contracts-upgradeable@${TRON_CONTRACTS_VERSION}/`,
      `@openzeppelin/tron-contracts/=@openzeppelin/tron-contracts@${TRON_CONTRACTS_VERSION}/`,
    ],
    openInRemix: {
      label: 'Open in TRON IDE',
      icon: TronIcon,
      url: tronIdeURL,
      // TRON IDE's URL loader decodes with plain atob (no UTF-8 pass): a
      // non-ASCII source loads as mojibake that still compiles — e.g. a
      // corrupted token name baked into on-chain state — so opening is
      // disabled for those sources instead of warned about.
      unsupportedSource: {
        test: containsNonAscii,
        tooltip:
          "TRON IDE's URL loader corrupts non-ASCII characters, such as in the token name. Copy the code or download the file instead.",
      },
      // TRON IDE has no proxy deployment (unlike Remix), for UUPS and
      // transparent alike, so upgradeable contracts grey the button out and
      // point at the downloads, which deploy through the TRON upgrades
      // plugins. Governor has no Hardhat/TronBox downloads to point to (a
      // Governor needs a token contract alongside it), so it gets the shorter
      // message.
      upgradeableWarning: (opts?: GenericOptions) =>
        opts?.kind === 'Governor'
          ? 'TRON IDE deploys only the implementation contract. Deploy and initialize a proxy yourself after deploying the implementation.'
          : 'TRON IDE deploys only the implementation contract. Deploy and initialize a proxy yourself after deploying the implementation, or download the Hardhat or TronBox package to deploy through the TRON upgrades plugins.',
    },
    // The "Single file" download names the package the imports come from.
    npmPackageName: '@openzeppelin/tron-contracts',
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
