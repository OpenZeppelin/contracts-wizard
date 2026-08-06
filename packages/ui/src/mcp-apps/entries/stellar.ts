import { mountKindApp } from '../mount';
import { MCP_KIND_SENTINEL } from '../kind-sentinel';
import { stellarAdapter } from '../stellar/adapter';

// Sentinel replaced at serve time with the tool's kind (e.g. "Fungible").
void mountKindApp(stellarAdapter, MCP_KIND_SENTINEL as 'Fungible');
