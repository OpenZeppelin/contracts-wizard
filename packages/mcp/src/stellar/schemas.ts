import { z } from 'zod';
import {
  commonDescriptions,
  stellarCommonDescriptions,
  stellarFungibleDescriptions,
  stellarNonFungibleDescriptions,
} from '@openzeppelin/wizard-common';

export const commonSchema = {
  upgradeable: z
    .boolean()
    .optional()
    .describe(
      stellarCommonDescriptions.upgradeable
    ),
  info: z
    .object({
      license: z.string().optional().describe(stellarCommonDescriptions.license),
    })
    .optional()
    .describe(stellarCommonDescriptions.info),
};

export const fungibleSchema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  premint: z.string().optional().describe(stellarFungibleDescriptions.premint),
  mintable: z.boolean().optional().describe(commonDescriptions.mintable),
  ...commonSchema,
};

export const nonFungibleSchema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  enumerable: z.boolean().optional().describe(stellarNonFungibleDescriptions.enumerable),
  consecutive: z.boolean().optional().describe(stellarNonFungibleDescriptions.consecutive),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  mintable: z.boolean().optional().describe(commonDescriptions.mintable),
  sequential: z.boolean().optional().describe(stellarNonFungibleDescriptions.sequential),
  ...commonSchema,
};
