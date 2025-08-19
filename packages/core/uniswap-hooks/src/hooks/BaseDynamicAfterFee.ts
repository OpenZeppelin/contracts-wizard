import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const BaseDynamicAfterFee: Hook = {
  name: 'BaseDynamicAfterFee',
  category: 'Fee',
  tooltipText:
    'Enforces a post-swap target and captures any positive difference as a hook fee, then lets you handle or distribute it.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/fee#BaseDynamicAfterFee',
  functions: {
    ...defineFunctions({}),
  },
};

export { BaseDynamicAfterFee };
