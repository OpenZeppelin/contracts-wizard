import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const BaseOverrideFee: Hook = {
  name: 'BaseOverrideFee',
  category: 'Fee',
  tooltipText: 'Automatically sets a dynamic fee before each swap, computed per trade according to your fee function.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/fee#BaseOverrideFee',
  functions: {
    ...defineFunctions({
      // dynamically override the fee (required)
      _getFee: {
        kind: 'internal',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'params', type: 'SwapParams calldata' },
          { name: 'hookData', type: 'bytes calldata' },
        ],
        returns: ['uint24'],
      },
    }),
  },
};

export { BaseOverrideFee };
