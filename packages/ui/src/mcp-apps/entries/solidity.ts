import { mountKindApp } from '../mount';
import { MCP_KIND_PLACEHOLDER } from '../kind-placeholder';
import { solidityAdapter } from '../solidity/adapter';

// Kind placeholder replaced at serve time with the tool's kind (e.g. "ERC20").
void mountKindApp(solidityAdapter, MCP_KIND_PLACEHOLDER as 'ERC20');
