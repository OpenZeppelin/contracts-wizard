import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const LimitOrderHook: Hook = {
  name: 'LimitOrderHook',
  category: 'General',
  tooltipText:
    'Out‑of‑range limit orders that execute on tick cross; adds one currency, accrue fees to the order, and support cancel/withdraw.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/general#LimitOrderHook',
  functions: {
    ...defineFunctions({}),
  },
};

export { LimitOrderHook };
