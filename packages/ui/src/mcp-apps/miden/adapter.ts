import type { ComponentType } from 'svelte';

import type { KindedOptions, Kind } from '@openzeppelin/wizard-miden';
import { ContractBuilder, buildGeneric, printContract, OptionsError } from '@openzeppelin/wizard-miden';

import hljs from '../../miden/highlightjs';
import { injectHyperlinks } from '../../miden/inject-hyperlinks';
import type { KindAdapter } from '../adapter';

import FungibleControls from '../../miden/FungibleControls.svelte';
import NonFungibleControls from '../../miden/NonFungibleControls.svelte';

const controls: Record<Kind, ComponentType> = {
  Fungible: FungibleControls,
  NonFungible: NonFungibleControls,
};

export const midenAdapter = {
  emptyContract: () => new ContractBuilder('MyToken'),
  build: opts => buildGeneric(opts as KindedOptions[Kind]),
  print: contract => printContract(contract as Parameters<typeof printContract>[0]),
  optionsErrors: e => (e instanceof OptionsError ? e.messages : undefined),
  highlight: code => hljs.highlight('rust', code).value,
  injectHyperlinks,
  highlightClass: '-miden',
  fence: 'rust',
  controls,
} satisfies KindAdapter;
