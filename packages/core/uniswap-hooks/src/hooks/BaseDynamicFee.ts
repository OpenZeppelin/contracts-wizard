import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const BaseDynamicFee: Hook = {
  name: 'BaseDynamicFee',
  category: 'Fee',
  tooltipText:
    'Applies a dynamic LP fee via the PoolManager; lets you update the fee over time based on your own logic.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/fee#BaseDynamicFee',
  functions: {
    ...defineFunctions({
      // dynamically override the fee (required)
      _getFee: {
        kind: 'internal',
        args: [{ name: 'key', type: 'PoolKey calldata' }],
        returns: ['uint24'],
      },
      // poke the fee (required)
      poke: {
        kind: 'public', // external/public for our generator purposes
        args: [{ name: 'key', type: 'PoolKey calldata' }],
      },
    }),
  },
};

export { BaseDynamicFee };
