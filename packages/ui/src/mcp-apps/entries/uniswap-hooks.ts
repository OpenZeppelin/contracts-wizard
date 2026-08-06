import { mountKindApp } from '../mount';
import { MCP_KIND_PLACEHOLDER } from '../kind-placeholder';
import { uniswapHooksAdapter } from '../uniswap-hooks/adapter';

// Kind placeholder replaced at serve time with the tool's kind (e.g. "Hooks").
void mountKindApp(uniswapHooksAdapter, MCP_KIND_PLACEHOLDER as 'Hooks');
