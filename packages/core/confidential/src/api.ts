import type { WizardContractAPI } from '@openzeppelin/wizard';
import type { ERC7984Options } from './erc7984';
import { printERC7984, defaults as erc7984Defaults } from './erc7984';

export type ERC7984 = Omit<WizardContractAPI<ERC7984Options>, 'getVersionedRemappings'>;

export const erc7984: ERC7984 = {
  print: printERC7984,
  defaults: erc7984Defaults,
};
