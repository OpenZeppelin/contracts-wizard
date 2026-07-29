import type { App } from '@modelcontextprotocol/ext-apps';

export type HostSendCaps = {
  message: boolean;
  updateModelContext: boolean;
};

export function readHostSendCaps(app: App): HostSendCaps {
  const caps = app.getHostCapabilities();
  return {
    message: caps?.message != null,
    updateModelContext: caps?.updateModelContext != null,
  };
}

export function canSendToHost(caps: HostSendCaps): boolean {
  return caps.message || caps.updateModelContext;
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
 * - updateModelContext only: stage source, then error so the UI can copy — host cannot
 *   start a model turn.
 * - neither: caller/UI falls back to clipboard (Cursor today).
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
      if (!caps.message) {
        throw e instanceof Error ? e : new Error(String(e));
      }
    }
  }

  if (caps.message) {
    await app.sendMessage({
      role: 'user',
      content: [{ type: 'text', text: messageWithCode(fence, code) }],
    });
    return { mode: caps.updateModelContext ? 'context-and-message' : 'message' };
  }

  throw new Error(
    'Host stored the contract in model context but cannot send a chat message. Copy the source and paste it into the chat.',
  );
}

export async function copyContractToClipboard(code: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard is not available in this host.');
  }
  await navigator.clipboard.writeText(code);
}
