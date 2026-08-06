import { mountKindApp } from '../mount';
import { MCP_KIND_SENTINEL } from '../kind-sentinel';
import { confidentialAdapter } from '../confidential/adapter';

// Sentinel replaced at serve time with the tool's kind (e.g. "ERC7984").
void mountKindApp(confidentialAdapter, MCP_KIND_SENTINEL as 'ERC7984');
