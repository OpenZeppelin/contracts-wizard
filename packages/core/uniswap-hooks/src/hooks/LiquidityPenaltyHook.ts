import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const LiquidityPenaltyHook: Hook = {
  name: 'LiquidityPenaltyHook',
  category: 'General',
  tooltipText:
    'JIT‑resistant: withholds and penalizes LP fees when liquidity is added then removed within a block window; penalties are donated to in‑range LPs.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/general#LiquidityPenaltyHook',
  functions: {
    ...defineFunctions({}),
  },
};

export { LiquidityPenaltyHook };
