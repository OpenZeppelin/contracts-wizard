import { mountKindApp } from '../mount';
import { MCP_KIND_SENTINEL } from '../kind-sentinel';
import { stylusAdapter } from '../stylus/adapter';

// Sentinel replaced at serve time with the tool's kind (e.g. "ERC20").
void mountKindApp(stylusAdapter, MCP_KIND_SENTINEL as 'ERC20');
