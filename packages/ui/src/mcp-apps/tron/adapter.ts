import type { ComponentType } from 'svelte';

import type { GenericOptions, Kind } from '@openzeppelin/wizard';
import {
  ContractBuilder,
  buildGeneric,
  printContract,
  OptionsError,
  sanitizeTronOptions,
  tronPrintProfile,
} from '@openzeppelin/wizard';

import hljs from '../../solidity/highlightjs';
import { injectHyperlinks } from '../../solidity/inject-hyperlinks';
import ERC20Controls from '../../solidity/ERC20Controls.svelte';
import ERC721Controls from '../../solidity/ERC721Controls.svelte';
import ERC1155Controls from '../../solidity/ERC1155Controls.svelte';
import GovernorControls from '../../solidity/GovernorControls.svelte';
import CustomControls from '../../solidity/CustomControls.svelte';
import { defineOmitFeatures } from '../../tron/handle-unsupported-features';
import type { KindAdapter } from '../adapter';

const controls: Record<string, ComponentType> = {
  ERC20: ERC20Controls,
  ERC721: ERC721Controls,
  ERC1155: ERC1155Controls,
  Governor: GovernorControls,
  Custom: CustomControls,
};

const omitFeatures = defineOmitFeatures();

export const tronAdapter = {
  emptyContract: () => new ContractBuilder('MyToken'),
  build: opts => buildGeneric(sanitizeTronOptions({ ...(opts as GenericOptions) })),
  print: contract => printContract(contract as Parameters<typeof printContract>[0], tronPrintProfile),
  optionsErrors: e => (e instanceof OptionsError ? e.messages : undefined),
  highlight: code => hljs.highlight('solidity', code).value,
  injectHyperlinks,
  highlightClass: '-solidity',
  fence: 'solidity',
  controls,
  controlProps: (kind: string) => ({ omitFeatures: omitFeatures.get(kind as Kind) }),
} satisfies KindAdapter;
