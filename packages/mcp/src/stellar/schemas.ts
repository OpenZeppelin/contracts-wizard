import { z } from 'zod';
import {
  commonDescriptions,
  stellarGovernorDescriptions,
  infoDescriptions,
  stellarCommonDescriptions,
  stellarFungibleDescriptions,
  stellarNonFungibleDescriptions,
  stellarStablecoinDescriptions,
} from '@openzeppelin/wizard-common';
import type { KindedOptions } from '@openzeppelin/wizard-stellar';

/**
 * Static type assertions to ensure schemas satisfy the Wizard API types. Not called at runtime.
 */
function _typeAssertions() {
  const _assertions: {
    [K in keyof KindedOptions]: Omit<KindedOptions[K], 'kind'>;
  } = {
    Fungible: z.object(fungibleSchema).parse({}),
    Governor: z.object(governorSchema).parse({}),
    Stablecoin: z.object(stablecoinSchema).parse({}),
    NonFungible: z.object(nonFungibleSchema).parse({}),
  };
}

const infoSchema = z
  .object({
    securityContact: z.string().optional().describe(infoDescriptions.securityContact),
    license: z.string().optional().describe(infoDescriptions.license),
  })
  .optional()
  .describe(infoDescriptions.info);

export const commonSchema = {
  access: z.literal('ownable').or(z.literal('roles')).optional().describe(stellarCommonDescriptions.access),
  explicitImplementations: z.boolean().optional().describe(stellarCommonDescriptions.explicitImplementations),
  upgradeable: z.boolean().optional().describe(stellarCommonDescriptions.upgradeable),
  info: infoSchema,
} as const satisfies z.ZodRawShape;

export const fungibleSchema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  votes: z.boolean().optional().describe(stellarFungibleDescriptions.votes),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  premint: z.string().optional().describe(stellarFungibleDescriptions.premint),
  mintable: z.boolean().optional().describe(commonDescriptions.mintable),
  ...commonSchema,
} as const satisfies z.ZodRawShape;

export const governorSchema = {
  name: z.string().describe(commonDescriptions.name),
  version: z.string().optional().describe(stellarGovernorDescriptions.version),
  votingDelay: z.string().optional().describe(stellarGovernorDescriptions.votingDelay),
  votingPeriod: z.string().optional().describe(stellarGovernorDescriptions.votingPeriod),
  proposalThreshold: z.string().optional().describe(stellarGovernorDescriptions.proposalThreshold),
  quorum: z.string().optional().describe(stellarGovernorDescriptions.quorum),
  timelock: z.boolean().optional().describe(stellarGovernorDescriptions.timelock),
  ...commonSchema,
} as const satisfies z.ZodRawShape;

export const stablecoinSchema = {
  ...fungibleSchema,
  limitations: z
    .literal(false)
    .or(z.literal('allowlist'))
    .or(z.literal('blocklist'))
    .optional()
    .describe(stellarStablecoinDescriptions.limitations),
} as const satisfies z.ZodRawShape;

export const nonFungibleSchema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  tokenUri: z.string().optional().describe(stellarNonFungibleDescriptions.tokenUri),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  votes: z.boolean().optional().describe(stellarNonFungibleDescriptions.votes),
  enumerable: z.boolean().optional().describe(stellarNonFungibleDescriptions.enumerable),
  consecutive: z.boolean().optional().describe(stellarNonFungibleDescriptions.consecutive),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  mintable: z.boolean().optional().describe(commonDescriptions.mintable),
  sequential: z.boolean().optional().describe(stellarNonFungibleDescriptions.sequential),
  ...commonSchema,
} as const satisfies z.ZodRawShape;
