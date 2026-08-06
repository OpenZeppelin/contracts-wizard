import { mountKindApp } from '../mount';
import { MCP_KIND_SENTINEL } from '../kind-sentinel';
import { uniswapHooksAdapter } from '../uniswap-hooks/adapter';

// Sentinel replaced at serve time with the tool's kind (e.g. "Hooks").
void mountKindApp(uniswapHooksAdapter, MCP_KIND_SENTINEL as 'Hooks');
