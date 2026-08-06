import { mountKindApp } from '../mount';
import { MCP_KIND_PLACEHOLDER } from '../kind-placeholder';
import { stylusAdapter } from '../stylus/adapter';

// Kind placeholder replaced at serve time with the tool's kind (e.g. "ERC20").
void mountKindApp(stylusAdapter, MCP_KIND_PLACEHOLDER as 'ERC20');
