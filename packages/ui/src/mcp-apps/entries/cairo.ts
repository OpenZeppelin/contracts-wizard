import { mountKindApp } from '../mount';
import { MCP_KIND_PLACEHOLDER } from '../kind-placeholder';
import { cairoAdapter } from '../cairo/adapter';

// Kind placeholder replaced at serve time with the tool's kind (e.g. "ERC20").
void mountKindApp(cairoAdapter, MCP_KIND_PLACEHOLDER as 'ERC20');
