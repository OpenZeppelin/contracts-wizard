import type { ComponentType } from 'svelte';

import type { KindedOptions, Kind } from '@openzeppelin/wizard-cairo';
import { ContractBuilder, buildGeneric, printContract, OptionsError, macrosDefaults } from '@openzeppelin/wizard-cairo';

import hljs from '../../cairo/highlightjs';
import { injectHyperlinks } from '../../cairo/inject-hyperlinks';
import type { KindAdapter } from '../adapter';

import ERC20Controls from '../../cairo/ERC20Controls.svelte';
import ERC721Controls from '../../cairo/ERC721Controls.svelte';
import ERC1155Controls from '../../cairo/ERC1155Controls.svelte';
import AccountControls from '../../cairo/AccountControls.svelte';
import MultisigControls from '../../cairo/MultisigControls.svelte';
import GovernorControls from '../../cairo/GovernorControls.svelte';
import VestingControls from '../../cairo/VestingControls.svelte';
import CustomControls from '../../cairo/CustomControls.svelte';

const controls: Record<Kind, ComponentType> = {
  ERC20: ERC20Controls,
  ERC721: ERC721Controls,
  ERC1155: ERC1155Controls,
  Account: AccountControls,
  Multisig: MultisigControls,
  Governor: GovernorControls,
  Vesting: VestingControls,
  Custom: CustomControls,
};

export const cairoAdapter: KindAdapter = {
  emptyContract: () => new ContractBuilder('MyToken', { withComponents: macrosDefaults.withComponents }),
  build: opts => buildGeneric(opts as KindedOptions[Kind]),
  print: contract => printContract(contract as Parameters<typeof printContract>[0]),
  optionsErrors: e => (e instanceof OptionsError ? e.messages : undefined),
  highlight: code => hljs.highlight('cairo', code).value,
  injectHyperlinks,
  highlightClass: '-cairo',
  fence: 'cairo',
  controls,
  controlProps: (kind, opts) => (kind === 'Account' ? { accountType: opts?.type } : {}),
};
