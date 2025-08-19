import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const BaseCustomAccounting: Hook = {
  name: 'BaseCustomAccounting',
  category: 'Base',
  tooltipText:
    'Base for custom accounting and hook-owned liquidity; implement how liquidity changes are computed and how liquidiy positions shares are minted/burned. Intended for a single pool key per instance.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/base#BaseCustomAccounting',
  functions: {
    ...defineFunctions({}),
  },
};

export { BaseCustomAccounting };
