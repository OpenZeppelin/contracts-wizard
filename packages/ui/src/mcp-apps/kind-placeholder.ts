/**
 * Kind placeholder baked into language MCP App templates at build time.
 * packages/mcp replaces it with the real kind string at serve time (must remain unique in the bundle).
 * Keep in sync with MCP_KIND_PLACEHOLDER in packages/mcp/src/apps/register.ts and package-mcp-apps.mjs.
 */
export const MCP_KIND_PLACEHOLDER = '__OZ_MCP_KIND__';
