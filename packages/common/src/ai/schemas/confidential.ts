import { z } from 'zod';
import { commonDescriptions, infoDescriptions, confidentialERC7984Descriptions } from '../../index';

export const confidentialCommonSchema = {
  info: z
    .object({
      securityContact: z.string().optional().describe(infoDescriptions.securityContact),
      license: z.string().optional().describe(infoDescriptions.license),
    })
    .optional()
    .describe(infoDescriptions.info),
} as const satisfies z.ZodRawShape;

export const confidentialERC7984Schema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  contractURI: z.string().describe(confidentialERC7984Descriptions.contractURI),
  premint: z.string().optional().describe(confidentialERC7984Descriptions.premint),
  networkConfig: z.literal('zama-ethereum').describe(confidentialERC7984Descriptions.networkConfig),
  wrappable: z.boolean().optional().describe(confidentialERC7984Descriptions.wrappable),
  votes: z.literal('blocknumber').or(z.literal('timestamp')).optional().describe(confidentialERC7984Descriptions.votes),
  ...confidentialCommonSchema,
} as const satisfies z.ZodRawShape;
