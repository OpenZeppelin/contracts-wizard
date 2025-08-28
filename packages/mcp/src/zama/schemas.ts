import { z } from 'zod';
import {
  commonDescriptions,
  infoDescriptions,
  zamaConfidentialFungibleDescriptions,
} from '@openzeppelin/wizard-common';
import type { KindedOptions } from '@openzeppelin/wizard-zama';

/**
 * Static type assertions to ensure schemas satisfy the Wizard API types. Not called at runtime.
 */
function _typeAssertions() {
  const _assertions: {
    [K in keyof KindedOptions]: Omit<KindedOptions[K], 'kind'>;
  } = {
    ConfidentialFungible: z.object(confidentialFungibleSchema).parse({}),
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

export const confidentialFungibleSchema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  tokenURI: z.string().describe(zamaConfidentialFungibleDescriptions.tokenURI),
  premint: z.string().optional().describe(zamaConfidentialFungibleDescriptions.premint),
  networkConfig: z.literal('zama-sepolia').or(z.literal('zama-ethereum')).describe(zamaConfidentialFungibleDescriptions.networkConfig),
  wrappable: z.boolean().optional().describe(zamaConfidentialFungibleDescriptions.wrappable),
  votes: z.literal('blocknumber').or(z.literal('timestamp')).optional().describe(zamaConfidentialFungibleDescriptions.votes),
  ...commonSchema,
} as const satisfies z.ZodRawShape;
