import type { AiFunctionPropertyDefinition } from '../types/function-definition.ts';
import { commonDescriptions } from '../../../../common/src/ai/descriptions/common.ts';

const sharedFunctionDescription = {
  name: { type: 'string', description: commonDescriptions.name },

  symbol: { type: 'string', description: commonDescriptions.symbol },

  burnable: {
    type: 'boolean',
    description: commonDescriptions.burnable,
  },

  pausable: {
    type: 'boolean',
    description: commonDescriptions.pausable,
  },

  mintable: {
    type: 'boolean',
    description: commonDescriptions.mintable,
  },
} as const satisfies AiFunctionPropertyDefinition<{
  name: string;
  symbol: string;
  burnable: boolean;
  pausable: boolean;
  mintable: boolean;
}>['properties'];

export const addFunctionPropertiesFrom = <
  TContract,
  TCommonOptions extends Record<string, unknown> = Record<string, unknown>,
  TCommonOptionName extends keyof (typeof sharedFunctionDescription & TCommonOptions) &
    keyof TContract = keyof (typeof sharedFunctionDescription & TCommonOptions) & keyof TContract,
>(
  commonOptions: TCommonOptions,
  commonOptionNames: TCommonOptionName[],
) =>
  commonOptionNames.reduce(
    (pickedCommonOptions, commonOptionName) => ({
      ...pickedCommonOptions,
      [commonOptionName]: { ...commonOptions, ...sharedFunctionDescription }[commonOptionName],
    }),
    {} as Pick<typeof sharedFunctionDescription & TCommonOptions, TCommonOptionName>,
  );
