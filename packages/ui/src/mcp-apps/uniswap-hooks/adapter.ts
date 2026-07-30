import type { ComponentType } from 'svelte';

import { ContractBuilder, OptionsError } from '@openzeppelin/wizard';
import type { KindedOptions, Kind } from '@openzeppelin/wizard-uniswap-hooks';
import { buildGeneric, printContract } from '@openzeppelin/wizard-uniswap-hooks';

import hljs from '../../solidity/highlightjs';
import { injectHyperlinks } from '../../uniswap-hooks/inject-hyperlinks';
import type { KindAdapter } from '../adapter';

import HooksControls from '../../uniswap-hooks/HooksControls.svelte';

const controls: Record<Kind, ComponentType> = {
  Hooks: HooksControls,
};

export const uniswapHooksAdapter: KindAdapter = {
  emptyContract: () => new ContractBuilder('MyHook'),
  build: opts => buildGeneric(opts as KindedOptions[Kind]),
  print: contract => printContract(contract as Parameters<typeof printContract>[0]),
  optionsErrors: e => (e instanceof OptionsError ? e.messages : undefined),
  highlight: code => hljs.highlight('solidity', code).value,
  injectHyperlinks,
  highlightClass: '-solidity',
  fence: 'solidity',
  controls,
};
