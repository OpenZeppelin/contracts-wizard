import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const BaseOverrideFee: Hook = {
  name: 'BaseOverrideFee',
  category: 'Fee',
  tooltipText: 'Automatically sets a dynamic fee before each swap, computed per trade according to your fee function.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/fee#BaseOverrideFee',
  functions: {
    ...defineFunctions({}),
  },
};

export { BaseOverrideFee };
