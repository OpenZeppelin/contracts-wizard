import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GovernorOptions } from '@openzeppelin/wizard';
import {
  buildGeneric,
  printContract,
  tronPrintProfile,
  TRON_DEFAULT_BLOCK_TIME,
  sanitizeTronOptions,
} from '@openzeppelin/wizard';
import { makeDetailedPrompt } from '../../utils';
import { tronGovernorSchema } from '@openzeppelin/wizard-common/schemas';
import { tronPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerTronGovernor(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'tron-governor',
    {
      description: makeDetailedPrompt(tronPrompts.Governor),
      inputSchema: tronGovernorSchema,
      title: 'TRON Governor',
    },
    async ({
      name,
      delay,
      period,
      votes,
      clockMode,
      timelock,
      blockTime,
      decimals,
      proposalThreshold,
      quorumMode,
      quorumPercent,
      quorumAbsolute,
      storage,
      settings,
      crossChainExecution,
      upgradeable,
      info,
    }) => {
      const opts: GovernorOptions = {
        name,
        delay,
        period,
        votes,
        clockMode,
        timelock,
        // TRON produces blocks every ~3s (vs ~12s on Ethereum); apply that
        // default when the caller hasn't supplied one so the generated
        // voting delay/period in blocks matches TRON's chain.
        blockTime: blockTime ?? TRON_DEFAULT_BLOCK_TIME,
        decimals,
        proposalThreshold,
        quorumMode,
        quorumPercent,
        quorumAbsolute,
        storage,
        settings,
        crossChainExecution,
        upgradeable,
        info,
      };
      const tronOpts = sanitizeTronOptions({ kind: 'Governor' as const, ...opts });
      return wizardAppPrintResult(tronOpts, () => printContract(buildGeneric(tronOpts), tronPrintProfile), 'solidity');
    },
  );
}
