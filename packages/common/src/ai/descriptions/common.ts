// IMPORTANT: This file must not have any imports since it is used in both Node and Deno environments,
// which have different requirements for file extensions in import statements.

export const commonDescriptions = {
  name: 'The name of the contract',
  symbol: 'The short symbol for the token',
  burnable: 'Whether token holders will be able to destroy their tokens',
  pausable:
    'Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response.',
  mintable: 'Whether privileged accounts will be able to create more supply or emit more tokens',
};
