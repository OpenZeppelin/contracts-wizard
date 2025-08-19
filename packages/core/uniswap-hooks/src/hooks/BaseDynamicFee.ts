import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const BaseDynamicFee: Hook = {
  name: 'BaseDynamicFee',
  category: 'Fee',
  tooltipText:
    'Applies a dynamic LP fee via the PoolManager; lets you update the fee over time based on your own logic.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/fee#BaseDynamicFee',
  functions: {
    ...defineFunctions({}),
  },
};

export { BaseDynamicFee };
