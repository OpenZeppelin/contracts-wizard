import type { ComponentType } from 'svelte';

/** Per-field validation messages, structurally identical across all Wizard languages. */
export type KindErrors = { [prop in string]?: string };

/**
 * Everything that differs between languages in an MCP App, expressed as data so
 * `KindApp.svelte` stays the single implementation of the host protocol.
 *
 * Each language's adapter closes over its own Wizard package, so the generic
 * component only sees opaque contracts.
 */
export type KindAdapter = {
  /** Placeholder contract rendered before the host applies any options. */
  emptyContract: () => unknown;
  /** Build a contract from options; throws on invalid options. */
  build: (opts: unknown) => unknown;
  print: (contract: unknown) => string;
  /** Per-field messages when `e` is a Wizard options error, otherwise undefined. */
  optionsErrors: (e: unknown) => KindErrors | undefined;
  /** Syntax-highlight generated source, returning HTML. */
  highlight: (code: string) => string;
  /** Turn import paths in highlighted HTML into docs links. */
  injectHyperlinks: (html: string) => string;
  /** `hljs` theme class for the preview pane. */
  highlightClass: string;
  /** Markdown fence language used when handing the contract to the agent. */
  fence: string;
  /** Controls component per contract kind. */
  controls: Record<string, ComponentType>;
  /** Extra props for a kind's Controls component (e.g. Cairo Account's `accountType`). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlProps?: (kind: string, opts: any) => Record<string, unknown>;
};
