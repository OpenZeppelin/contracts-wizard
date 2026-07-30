import type { Writable } from 'svelte/store';

/** Svelte context key for MCP Apps outbound link handling. */
export const MCP_EXTERNAL_LINKS_CONTEXT = 'mcp-external-links';

/**
 * When set (MCP Apps), outbound docs/import links use host `openLink` if `canOpen`.
 * When unset (web Wizard), HelpTooltip keeps normal `<a target="_blank">` links.
 *
 * Stored as a writable so HelpTooltip re-renders when `openLinks` arrives after connect.
 */
export type McpExternalLinks = {
  canOpen: boolean;
  open: (url: string) => Promise<void>;
};

export type McpExternalLinksStore = Writable<McpExternalLinks>;
