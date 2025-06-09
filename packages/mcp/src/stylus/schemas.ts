import { z } from 'zod';

export const commonSchema = {
  info: z
    .object({
      license: z.string().optional().describe('The license used by the contract, default is "MIT"'),
    })
    .optional()
    .describe('Metadata about the contract'),
};

export const erc20Schema = {
  name: z.string().describe('The name of the contract'),
  burnable: z.boolean().optional().describe('Whether token holders will be able to destroy their tokens'),
  permit: z.boolean().optional().describe('Whether without paying gas, token holders will be able to allow third parties to transfer from their account.'),
  flashmint: z.boolean().optional().describe('Whether to include built-in flash loans to allow lending tokens without requiring collateral as long as they\'re returned in the same transaction.'),
  ...commonSchema,
};

export const erc721Schema = {
  name: z.string().describe('The name of the contract'),
  burnable: z.boolean().optional().describe('Whether token holders will be able to destroy their tokens'),
  enumerable: z.boolean().optional().describe('Whether to allow on-chain enumeration of all tokens or those owned by an account. Increases gas cost of transfers.'),
  ...commonSchema,
};

export const erc1155Schema = {
  name: z.string().describe('The name of the contract'),
  burnable: z.boolean().optional().describe('Whether token holders will be able to destroy their tokens'),
  supply: z.boolean().optional().describe('Whether to keep track of total supply of tokens'),
  ...commonSchema,
};
