import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC7984Options } from '@openzeppelin/wizard-confidential';
import { erc7984 } from '@openzeppelin/wizard-confidential';
import { makeDetailedPrompt } from '../../utils';
import { confidentialERC7984Schema } from '@openzeppelin/wizard-common/schemas';
import { confidentialPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerConfidentialERC7984(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'confidential-erc7984',
    {
      description: makeDetailedPrompt(confidentialPrompts.ERC7984),
      inputSchema: confidentialERC7984Schema,
      title: 'Confidential ERC7984',
    },
    async ({ name, symbol, contractURI, decimals, premint, networkConfig, wrappable, votes, info }) => {
      const opts: ERC7984Options = {
        name,
        symbol,
        contractURI,
        decimals,
        premint,
        networkConfig,
        wrappable,
        votes,
        info,
      };
      return wizardAppPrintResult(opts, () => erc7984.print(opts), 'solidity');
    },
  );
}
