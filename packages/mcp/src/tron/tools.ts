import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTronTRC20 } from './tools/erc20.js';
import { registerTronTRC721 } from './tools/erc721.js';
import { registerTronTRC1155 } from './tools/erc1155.js';
import { registerTronStablecoin } from './tools/stablecoin.js';
import { registerTronRWA } from './tools/rwa.js';
import { registerTronGovernor } from './tools/governor.js';
import { registerTronCustom } from './tools/custom.js';

// TRON tools reuse the Solidity schemas (options are identical) and pipe the
// output through `rewriteForTron` so token standards become TRC* and imports
// resolve from `@openzeppelin/tron-contracts`. Account is intentionally
// excluded — ERC-4337 EntryPoint is not in TRON support scope.
export function registerTronTools(server: McpServer) {
  registerTronTRC20(server);
  registerTronTRC721(server);
  registerTronTRC1155(server);
  registerTronStablecoin(server);
  registerTronRWA(server);
  registerTronGovernor(server);
  registerTronCustom(server);
}
