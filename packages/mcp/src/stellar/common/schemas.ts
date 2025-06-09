import { z } from 'zod';

export const commonSchema = {
  upgradeable: z
    .boolean()
    .optional()
    .describe(
      'Whether the smart contract is upgradeable.'
    ),
  info: z
    .object({
      license: z.string().optional().describe('The license used by the contract, default is "MIT"'),
    })
    .optional()
    .describe('Metadata about the contract'),
};

export const fungibleSchema = {
  name: z.string().describe('The name of the contract'),
  symbol: z.string().describe('The short symbol for the token'),
  burnable: z.boolean().optional().describe('Whether token holders will be able to destroy their tokens'),
  pausable: z.boolean().optional().describe('Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response.'),
  premint: z.string().optional().describe('The number of tokens to premint for the deployer.'),
  mintable: z.boolean().optional().describe('Whether privileged accounts will be able to create more supply or emit more tokens'),
  ...commonSchema,
};

export const nonFungibleSchema = {
  name: z.string().describe('The name of the contract'),
  symbol: z.string().describe('The short symbol for the token'),
  burnable: z.boolean().optional().describe('Whether token holders will be able to destroy their tokens'),
  enumerable: z.boolean().optional().describe('Whether the NFTs are enumerable (can be iterated over).'),
  consecutive: z.boolean().optional().describe('To batch mint NFTs instead of minting them individually (sequential minting is mandatory).'),
  pausable: z.boolean().optional().describe('Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response.'),
  mintable: z.boolean().optional().describe('Whether privileged accounts will be able to create more supply or emit more tokens'),
  sequential: z.boolean().optional().describe('Whether the IDs of the minted NFTs will be sequential.'),
  ...commonSchema,
};
