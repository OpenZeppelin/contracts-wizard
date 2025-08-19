import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const BaseCustomCurve: Hook = {
  name: 'BaseCustomCurve',
  category: 'Base',
  tooltipText:
    'Base for custom swap curves overriding default pricing; define the unspecified amount during swaps. Builds on the custom accounting base.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/base#BaseCustomCurve',
  functions: {
    ...defineFunctions({}),
  },
};

export { BaseCustomCurve };
