import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const AntiSandwichHook: Hook = {
  name: 'AntiSandwichHook',
  category: 'General',
  tooltipText: 'Anchors swap pricing to the beginning-of-block state to deter intra-block sandwich manipulation.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/general#AntiSandwichHook',
  functions: {
    ...defineFunctions({}),
  },
};

export { AntiSandwichHook };
