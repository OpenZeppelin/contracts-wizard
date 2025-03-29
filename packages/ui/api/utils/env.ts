export const getEnvironmentVariablesOrFail = <TEnvironmentVariableNames extends string>(
  environmentVariableNames: TEnvironmentVariableNames | TEnvironmentVariableNames[],
): Record<TEnvironmentVariableNames, string> => {
  const environmentVariables = Array.isArray(environmentVariableNames)
    ? environmentVariableNames
    : [environmentVariableNames];

  return environmentVariables.reduce(
    (checkedEnvironmentVariables, environmentVariableName) => {
      const environmentVariableValue = Deno.env.get(environmentVariableName);

      if (!environmentVariableValue)
        throw new Error(`environment variable ${environmentVariableName} is not available`);

      return { ...checkedEnvironmentVariables, [environmentVariableName]: environmentVariableValue };
    },
    {} as Record<TEnvironmentVariableNames, string>,
  );
};

export const getEnvironmentVariableOr = (environmentVariableName: string, fallbackValue: string) =>
  Deno.env.get(environmentVariableName) || fallbackValue;
