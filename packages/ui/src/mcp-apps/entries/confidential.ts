import { mountKindApp } from '../mount';
import { MCP_KIND_PLACEHOLDER } from '../kind-placeholder';
import { confidentialAdapter } from '../confidential/adapter';

// Kind placeholder replaced at serve time with the tool's kind (e.g. "ERC7984").
void mountKindApp(confidentialAdapter, MCP_KIND_PLACEHOLDER as 'ERC7984');
