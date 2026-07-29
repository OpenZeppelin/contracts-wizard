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

const SHORT_TRIGGER = 'Use this generated contract in the project.';

/**
 * Deliver the current contract source to the host agent.
 *
 * Capability matrix:
 * - message + updateModelContext: stage full source silently, send a short chat trigger
 *   (best UX — Claude today).
 * - message only: put full source in the chat message (self-contained; future hosts that
 *   add message without context).
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
      // If message exists, still try a self-contained chat send below.
      if (!caps.message) {
        throw e instanceof Error ? e : new Error(String(e));
      }
      await app.sendMessage({
        role: 'user',
        content: [
          {
            type: 'text',
            text: `${SHORT_TRIGGER}\n\n\`\`\`${fence}\n${code}\n\`\`\``,
          },
        ],
      });
      return { mode: 'message' };
    }
  }

  if (caps.message) {
    const text =
      caps.updateModelContext
        ? SHORT_TRIGGER
        : `${SHORT_TRIGGER}\n\n\`\`\`${fence}\n${code}\n\`\`\``;

    await app.sendMessage({
      role: 'user',
      content: [{ type: 'text', text }],
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
