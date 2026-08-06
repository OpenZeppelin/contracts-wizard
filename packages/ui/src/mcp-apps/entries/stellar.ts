import { mountKindApp } from '../mount';
import { MCP_KIND_PLACEHOLDER } from '../kind-placeholder';
import { stellarAdapter } from '../stellar/adapter';

// Kind placeholder replaced at serve time with the tool's kind (e.g. "Fungible").
void mountKindApp(stellarAdapter, MCP_KIND_PLACEHOLDER as 'Fungible');
