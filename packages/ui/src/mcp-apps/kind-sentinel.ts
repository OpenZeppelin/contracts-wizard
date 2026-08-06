/**
 * Placeholder kind baked into language MCP App templates at build time.
 * packages/mcp injects the real kind string at serve time (must remain a unique token in the bundle).
 * Keep in sync with MCP_KIND_SENTINEL in packages/mcp/src/apps/register.ts and package-mcp-apps.mjs.
 */
export const MCP_KIND_SENTINEL = '__OZ_MCP_KIND__';
