export const addFunctionPropertiesFrom = <
  TCommonOptions extends Record<string, unknown>,
  TCommonOptionName extends keyof TCommonOptions = keyof TCommonOptions,
>(
  commonOptions: TCommonOptions,
  commonOptionNames: TCommonOptionName[],
) =>
  commonOptionNames.reduce(
    (pickedCommonOptions, commonOptionName) => ({
      ...pickedCommonOptions,
      [commonOptionName]: commonOptions[commonOptionName],
    }),
    {} as Pick<TCommonOptions, TCommonOptionName>,
  );
