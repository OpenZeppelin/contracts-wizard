import { z } from 'zod';
import {
  commonDescriptions,
  stylusCommonDescriptions,
  stylusERC20Descriptions,
  stylusERC721Descriptions,
  stylusERC1155Descriptions,
} from '@openzeppelin/wizard-common';

export const commonSchema = {
  info: z
    .object({
      license: z.string().optional().describe(stylusCommonDescriptions.license),
    })
    .optional()
    .describe(stylusCommonDescriptions.info),
};

export const erc20Schema = {
  name: z.string().describe(commonDescriptions.name),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  permit: z.boolean().optional().describe(stylusERC20Descriptions.permit),
  flashmint: z.boolean().optional().describe(stylusERC20Descriptions.flashmint),
  ...commonSchema,
};

export const erc721Schema = {
  name: z.string().describe(commonDescriptions.name),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  enumerable: z.boolean().optional().describe(stylusERC721Descriptions.enumerable),
  ...commonSchema,
};

export const erc1155Schema = {
  name: z.string().describe(commonDescriptions.name),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  supply: z.boolean().optional().describe(stylusERC1155Descriptions.supply),
  ...commonSchema,
};
