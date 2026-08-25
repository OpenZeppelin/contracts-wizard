import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTronTRC20 } from './tools/erc20.js';
import { registerTronTRC721 } from './tools/erc721.js';
import { registerTronTRC1155 } from './tools/erc1155.js';
import { registerTronGovernor } from './tools/governor.js';
import { registerTronCustom } from './tools/custom.js';

// TRON tools reuse the Solidity schemas (options are identical) and render the
// output through `tronPrintProfile` so token standards become TRC* and imports
// resolve from `@openzeppelin/tron-contracts`. Excluded on purpose: Account
// (ERC-4337 EntryPoint out of scope) and Stablecoin / RealWorldAsset (they
// depend on @openzeppelin/community-contracts, which is not ported to TRON).
export function registerTronTools(server: McpServer) {
  registerTronTRC20(server);
  registerTronTRC721(server);
  registerTronTRC1155(server);
  registerTronGovernor(server);
  registerTronCustom(server);
}
