import type { ComponentType } from 'svelte';

import type { KindedOptions, Kind } from '@openzeppelin/wizard';
import { ContractBuilder, buildGeneric, printContract, OptionsError } from '@openzeppelin/wizard';

import hljs from '../../solidity/highlightjs';
import { injectHyperlinks } from '../../solidity/inject-hyperlinks';
import type { KindAdapter } from '../adapter';

import ERC20Controls from '../../solidity/ERC20Controls.svelte';
import ERC721Controls from '../../solidity/ERC721Controls.svelte';
import ERC1155Controls from '../../solidity/ERC1155Controls.svelte';
import StablecoinControls from '../../solidity/StablecoinControls.svelte';
import RealWorldAssetControls from '../../solidity/RealWorldAssetControls.svelte';
import AccountControls from '../../solidity/AccountControls.svelte';
import GovernorControls from '../../solidity/GovernorControls.svelte';
import CustomControls from '../../solidity/CustomControls.svelte';

const controls: Record<Kind, ComponentType> = {
  ERC20: ERC20Controls,
  ERC721: ERC721Controls,
  ERC1155: ERC1155Controls,
  Stablecoin: StablecoinControls,
  RealWorldAsset: RealWorldAssetControls,
  Account: AccountControls,
  Governor: GovernorControls,
  Custom: CustomControls,
};

export const solidityAdapter = {
  emptyContract: () => new ContractBuilder('MyToken'),
  build: opts => buildGeneric(opts as KindedOptions[Kind]),
  print: contract => printContract(contract as Parameters<typeof printContract>[0]),
  optionsErrors: e => (e instanceof OptionsError ? e.messages : undefined),
  highlight: code => hljs.highlight('solidity', code).value,
  injectHyperlinks,
  highlightClass: '-solidity',
  fence: 'solidity',
  controls,
} satisfies KindAdapter;
