import { z } from 'zod';

export const commonSchema = {
  access: z
    .literal('ownable')
    .or(z.literal('roles'))
    .optional()
    .describe(
      'The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions. Roles is a flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.'
    ),
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

export const erc20Schema = {
  name: z.string().describe('The name of the contract'),
  symbol: z.string().describe('The short symbol for the token'),
  burnable: z.boolean().optional().describe('Whether token holders will be able to destroy their tokens'),
  pausable: z.boolean().optional().describe('Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response.'),
  premint: z.string().optional().describe('The number of tokens to premint for the deployer'),
  mintable: z.boolean().optional().describe('Whether privileged accounts will be able to create more supply or emit more tokens'),
  votes: z
    .boolean()
    .optional()
    .describe('Whether to keep track of historical balances for voting in on-chain governance.'),
  appName: z.string().optional().describe('The name of the application, must be provided if votes are enabled'),
  appVersion: z.string().optional().describe('The version of the application, must be provided if votes are enabled. Default is v1'),
  ...commonSchema,
};
