import type { ComponentType } from 'svelte';

import { ContractBuilder, OptionsError } from '@openzeppelin/wizard';
import type { KindedOptions, Kind } from '@openzeppelin/wizard-confidential';
import { buildGeneric, printContract } from '@openzeppelin/wizard-confidential';

import hljs from '../../solidity/highlightjs';
import { injectHyperlinks } from '../../confidential/inject-hyperlinks';
import type { KindAdapter } from '../adapter';

import ERC7984Controls from '../../confidential/ERC7984Controls.svelte';

const controls: Record<Kind, ComponentType> = {
  ERC7984: ERC7984Controls,
};

export const confidentialAdapter: KindAdapter = {
  emptyContract: () => new ContractBuilder('MyToken'),
  build: opts => buildGeneric(opts as KindedOptions[Kind]),
  print: contract => printContract(contract as Parameters<typeof printContract>[0]),
  optionsErrors: e => (e instanceof OptionsError ? e.messages : undefined),
  highlight: code => hljs.highlight('solidity', code).value,
  injectHyperlinks,
  highlightClass: '-solidity',
  fence: 'solidity',
  controls,
};
