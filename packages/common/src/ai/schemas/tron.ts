import { z } from 'zod';
import { tronGovernorDescriptions } from '../../index';
import { solidityCommonSchema, solidityERC20Schema, solidityGovernorSchema } from './solidity';

// TRON tools reuse Solidity schemas except unsupported CCIP/ACE integration.
// Other options are reused almost verbatim — the options are
// identical and only the generated standard names / import paths differ
// (handled downstream by `tronPrintProfile`). The one exception is the Governor's
// `blockTime`, whose description must mention TRON's ~3s default without
// leaking that note into the shared Solidity (and Polkadot) schemas.
export const tronGovernorSchema = {
  ...solidityGovernorSchema,
  blockTime: z.number().optional().describe(tronGovernorDescriptions.blockTime),
} as const satisfies z.ZodRawShape;

export const tronERC20Schema = {
  ...solidityERC20Schema,
  crossChainBridging: z
    .literal('custom')
    .or(z.literal('erc7786native'))
    .or(z.literal('superchain'))
    .optional()
    .describe('Bridge mode: custom, ERC-7786 native, or Superchain. Availability depends on the selected network.'),
  chainlinkAce: z.literal(false).optional().describe('External policy integration is not supported on TRON.'),
  info: solidityCommonSchema.info,
} as const satisfies z.ZodRawShape;
