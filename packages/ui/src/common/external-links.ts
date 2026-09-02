import type { Writable } from 'svelte/store';

/** Svelte context key for MCP Apps outbound link handling. */
export const MCP_EXTERNAL_LINKS_CONTEXT = 'mcp-external-links';

/**
 * Set by MCP Apps (KindShell), unset in the web Wizard.
 *
 * When set, outbound links render as plain `<a href>` and a capture-phase delegate in
 * KindShell routes the click through the host's `openLink` — so consumers only need to
 * know whether opening a link is possible at all, and hide the link when it is not.
 * When unset, the web Wizard keeps normal `<a target="_blank">` links.
 *
 * Stored as a writable so consumers re-render when `openLinks` arrives after connect.
 */
export type McpExternalLinks = {
  canOpen: boolean;
};

export type McpExternalLinksStore = Writable<McpExternalLinks>;
