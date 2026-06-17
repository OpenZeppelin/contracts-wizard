import { z } from 'zod';
import { tronGovernorDescriptions } from '../../index';
import { solidityGovernorSchema } from './solidity';

// TRON tools reuse the Solidity schemas almost verbatim — the options are
// identical and only the generated standard names / import paths differ
// (handled downstream by `rewriteForTron`). The one exception is the Governor's
// `blockTime`, whose description must mention TRON's ~3s default without
// leaking that note into the shared Solidity (and Polkadot) schemas.
export const tronGovernorSchema = {
  ...solidityGovernorSchema,
  blockTime: z.number().optional().describe(tronGovernorDescriptions.blockTime),
} as const satisfies z.ZodRawShape;
