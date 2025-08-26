import { z } from 'zod';
import {
  commonDescriptions,
  infoDescriptions,
  stylusERC20Descriptions,
  stylusERC721Descriptions,
  stylusERC1155Descriptions,
} from '@openzeppelin/wizard-common';
import type { KindedOptions } from '@openzeppelin/wizard-stylus';

/**
 * Static type assertions to ensure schemas satisfy the Wizard API types. Not called at runtime.
 */
function _typeAssertions() {
  const _assertions: {
    [K in keyof KindedOptions]: Omit<KindedOptions[K], 'kind'>;
  } = {
    ERC20: z.object(erc20Schema).parse({}),
    ERC721: z.object(erc721Schema).parse({}),
    ERC1155: z.object(erc1155Schema).parse({}),
  };
}

export const commonSchema = {
  info: z
    .object({
      securityContact: z.string().optional().describe(infoDescriptions.securityContact),
      license: z.string().optional().describe(infoDescriptions.license),
    })
    .optional()
    .describe(infoDescriptions.info),
} as const satisfies z.ZodRawShape;

export const erc20Schema = {
  name: z.string().describe(commonDescriptions.name),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  permit: z.boolean().optional().describe(stylusERC20Descriptions.permit),
  flashmint: z.boolean().optional().describe(stylusERC20Descriptions.flashmint),
  ...commonSchema,
} as const satisfies z.ZodRawShape;

export const erc721Schema = {
  name: z.string().describe(commonDescriptions.name),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  enumerable: z.boolean().optional().describe(stylusERC721Descriptions.enumerable),
  ...commonSchema,
} as const satisfies z.ZodRawShape;

export const erc1155Schema = {
  name: z.string().describe(commonDescriptions.name),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  supply: z.boolean().optional().describe(stylusERC1155Descriptions.supply),
  ...commonSchema,
} as const satisfies z.ZodRawShape;
