/**
 * Kind placeholder baked into language MCP App templates at build time.
 * packages/mcp replaces it with the real kind string at serve time (must remain unique in the bundle).
 * Duplicated in packages/mcp and package-mcp-apps.mjs; kept aligned by register.test.ts.
 */
export const MCP_KIND_PLACEHOLDER = '__OZ_MCP_KIND__';
