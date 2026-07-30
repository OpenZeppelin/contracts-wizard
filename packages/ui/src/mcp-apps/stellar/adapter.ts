import type { ComponentType } from 'svelte';

import type { KindedOptions, Kind } from '@openzeppelin/wizard-stellar';
import { ContractBuilder, buildGeneric, printContract, OptionsError } from '@openzeppelin/wizard-stellar';

import hljs from '../../stellar/highlightjs';
import { injectHyperlinks } from '../../stellar/inject-hyperlinks';
import type { KindAdapter } from '../adapter';

import FungibleControls from '../../stellar/FungibleControls.svelte';
import NonFungibleControls from '../../stellar/NonFungibleControls.svelte';
import StablecoinControls from '../../stellar/StablecoinControls.svelte';
import GovernorControls from '../../stellar/GovernorControls.svelte';
import VaultControls from '../../stellar/VaultControls.svelte';

const controls: Record<Kind, ComponentType> = {
  Fungible: FungibleControls,
  NonFungible: NonFungibleControls,
  Stablecoin: StablecoinControls,
  Governor: GovernorControls,
  Vault: VaultControls,
};

export const stellarAdapter: KindAdapter = {
  emptyContract: () => new ContractBuilder('MyToken'),
  build: opts => buildGeneric(opts as KindedOptions[Kind]),
  print: contract => printContract(contract as Parameters<typeof printContract>[0]),
  optionsErrors: e => (e instanceof OptionsError ? e.messages : undefined),
  highlight: code => hljs.highlight('rust', code).value,
  injectHyperlinks,
  highlightClass: '-stellar',
  fence: 'rust',
  controls,
};
