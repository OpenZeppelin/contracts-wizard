import { z } from 'zod';
import {
  commonDescriptions,
  infoDescriptions,
  stylusERC20Descriptions,
  stylusERC721Descriptions,
  stylusERC1155Descriptions,
} from '../../index';

export const stylusCommonSchema = {
  info: z
    .object({
      securityContact: z.string().optional().describe(infoDescriptions.securityContact),
      license: z.string().optional().describe(infoDescriptions.license),
    })
    .optional()
    .describe(infoDescriptions.info),
} as const satisfies z.ZodRawShape;

export const stylusERC20Schema = {
  name: z.string().describe(commonDescriptions.name),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  permit: z.boolean().optional().describe(stylusERC20Descriptions.permit),
  flashmint: z.boolean().optional().describe(stylusERC20Descriptions.flashmint),
  ...stylusCommonSchema,
} as const satisfies z.ZodRawShape;

export const stylusERC721Schema = {
  name: z.string().describe(commonDescriptions.name),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  enumerable: z.boolean().optional().describe(stylusERC721Descriptions.enumerable),
  ...stylusCommonSchema,
} as const satisfies z.ZodRawShape;

export const stylusERC1155Schema = {
  name: z.string().describe(commonDescriptions.name),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  supply: z.boolean().optional().describe(stylusERC1155Descriptions.supply),
  ...stylusCommonSchema,
} as const satisfies z.ZodRawShape;
