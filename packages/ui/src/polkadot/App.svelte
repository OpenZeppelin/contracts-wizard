<script lang="ts">
  import App from '../solidity/App.svelte';
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

<App {initialTab} {initialOpts} {omitTabs} {omitFeatures} />
