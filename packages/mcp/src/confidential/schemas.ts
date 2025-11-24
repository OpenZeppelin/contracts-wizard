import { z } from 'zod';
import { commonDescriptions, infoDescriptions, confidentialERC7984Descriptions } from '@openzeppelin/wizard-common';
import type { KindedOptions } from '@openzeppelin/wizard-confidential';

/**
 * Static type assertions to ensure schemas satisfy the Wizard API types. Not called at runtime.
 */
function _typeAssertions() {
  const _assertions: {
    [K in keyof KindedOptions]: Omit<KindedOptions[K], 'kind'>;
  } = {
    ERC7984: z.object(erc7984Schema).parse({}),
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

export const erc7984Schema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  contractURI: z.string().describe(confidentialERC7984Descriptions.contractURI),
  premint: z.string().optional().describe(confidentialERC7984Descriptions.premint),
  networkConfig: z
    .literal('zama-sepolia')
    .or(z.literal('zama-ethereum'))
    .describe(confidentialERC7984Descriptions.networkConfig),
  wrappable: z.boolean().optional().describe(confidentialERC7984Descriptions.wrappable),
  votes: z.literal('blocknumber').or(z.literal('timestamp')).optional().describe(confidentialERC7984Descriptions.votes),
  ...commonSchema,
} as const satisfies z.ZodRawShape;
