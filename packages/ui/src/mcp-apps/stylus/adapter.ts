import type { ComponentType } from 'svelte';

import type { KindedOptions, Kind } from '@openzeppelin/wizard-stylus';
import { ContractBuilder, buildGeneric, printContract, OptionsError } from '@openzeppelin/wizard-stylus';

import hljs from '../../stylus/highlightjs';
import { injectHyperlinks } from '../../stylus/inject-hyperlinks';
import type { KindAdapter } from '../adapter';

import ERC20Controls from '../../stylus/ERC20Controls.svelte';
import ERC721Controls from '../../stylus/ERC721Controls.svelte';
import ERC1155Controls from '../../stylus/ERC1155Controls.svelte';

const controls: Record<Kind, ComponentType> = {
  ERC20: ERC20Controls,
  ERC721: ERC721Controls,
  ERC1155: ERC1155Controls,
};

export const stylusAdapter = {
  emptyContract: () => new ContractBuilder('MyToken'),
  build: opts => buildGeneric(opts as KindedOptions[Kind]),
  print: contract => printContract(contract as Parameters<typeof printContract>[0]),
  optionsErrors: e => (e instanceof OptionsError ? e.messages : undefined),
  highlight: code => hljs.highlight('rust', code).value,
  injectHyperlinks,
  highlightClass: '-stylus',
  fence: 'rust',
  controls,
} satisfies KindAdapter;
