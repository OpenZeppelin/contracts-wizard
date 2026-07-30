import type { App } from '@modelcontextprotocol/ext-apps';

export type HostSendCaps = {
  message: boolean;
  updateModelContext: boolean;
  openLinks: boolean;
};

/** Host rejected or user dismissed sendMessage (e.g. Claude replace-draft confirm → No). */
export class HandoffCancelledError extends Error {
  constructor(message = 'Update cancelled') {
    super(message);
    this.name = 'HandoffCancelledError';
  }
}

export function readHostSendCaps(app: App): HostSendCaps {
  const caps = app.getHostCapabilities();
  return {
    message: caps?.message != null,
    updateModelContext: caps?.updateModelContext != null,
    openLinks: caps?.openLinks != null,
  };
}

/** Send requires `message`; context-only hosts use Copy to Clipboard. */
export function canSendToHost(caps: HostSendCaps): boolean {
  return caps.message;
}

export async function openExternalLink(app: App, url: string): Promise<void> {
  const result = await app.openLink({ url });
  if (result.isError) {
    throw new Error('Host denied opening the link.');
  }
}

const SHORT_TRIGGER =
  'I refined this contract in the Wizard UI beyond the initial MCP tool result. Here is the current generated source.';

function messageWithCode(fence: string, code: string): string {
  // Keep single newlines; some hosts turn blank lines into paragraph spacing in the draft.
  return `${SHORT_TRIGGER}\n\n\`\`\`${fence}\n${code.trimEnd()}\n\`\`\``;
}

/**
 * Deliver the current contract source to the host agent.
 *
 * Always put the full source in `sendMessage` when `message` is available. Some hosts
 * (notably Claude's compose-draft flow) advertise `updateModelContext` but do not attach
 * that silent context to the user message the app injects — so a short trigger alone
 * leaves the agent without the contract.
 *
 * Capability matrix:
 * - message (+ optional updateModelContext): self-contained chat message with full source;
 *   also best-effort stage via updateModelContext when advertised.
 * - otherwise: caller/UI falls back to clipboard (Cursor today; context-only hosts too).
 */
export async function deliverContractToHost(
  app: App,
  code: string,
  fence: string,
): Promise<{ mode: 'message' | 'context-and-message' }> {
  const caps = readHostSendCaps(app);

  if (!canSendToHost(caps)) {
    throw new Error('This host does not support sending the contract to the agent.');
  }

  if (caps.updateModelContext) {
    try {
      await app.updateModelContext({
        content: [{ type: 'text', text: code }],
      });
    } catch (e) {
      console.warn('[mcp-apps] updateModelContext failed', e);
    }
  }

  const result = await app.sendMessage({
    role: 'user',
    content: [{ type: 'text', text: messageWithCode(fence, code) }],
  });
  if (result.isError) {
    throw new HandoffCancelledError();
  }
  return { mode: caps.updateModelContext ? 'context-and-message' : 'message' };
}

export async function copyContractToClipboard(code: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard is not available in this host.');
  }
  await navigator.clipboard.writeText(code);
}
