import { mountKindApp } from '../mount';
import { MCP_KIND_SENTINEL } from '../kind-sentinel';
import { solidityAdapter } from '../solidity/adapter';

// Sentinel replaced at serve time with the tool's kind (e.g. "ERC20").
void mountKindApp(solidityAdapter, MCP_KIND_SENTINEL as 'ERC20');
