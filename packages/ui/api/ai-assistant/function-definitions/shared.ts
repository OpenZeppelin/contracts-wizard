const sharedFunctionDescription = {
  name: { type: 'string', description: 'The name of the contract' },

  symbol: { type: 'string', description: 'The short symbol for the token' },

  burnable: {
    type: 'boolean',
    description: 'Whether token holders will be able to destroy their tokens',
  },

  pausable: {
    type: 'boolean',
    description:
      'Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response.',
  },

  mintable: {
    type: 'boolean',
    description: 'Whether privileged accounts will be able to create more supply or emit more tokens',
  },
} as const;

export const addFunctionPropertiesFrom = <
  TCommonOptions extends Record<string, unknown>,
  TCommonOptionName extends keyof (typeof sharedFunctionDescription &
    TCommonOptions) = keyof (typeof sharedFunctionDescription & TCommonOptions),
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
