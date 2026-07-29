import { App, PostMessageTransport } from '@modelcontextprotocol/ext-apps';
import type { ComponentType, SvelteComponent } from 'svelte';
import { readHostSendCaps } from './deliver-contract';

/** Stable iframe height for hosts that size from ui/notifications/size-changed. */
export const MCP_APP_HEIGHT_PX = 560;

/**
 * Mount a fixed-kind Wizard MCP App.
 * Component script runs synchronously and registers tool handlers on `mcpApp`
 * before we call `connect()`.
 *
 * autoResize is off: html/body height:100% layouts collapse under the SDK's
 * max-content measurement (ext-apps#143 / #619). We report a fixed height instead.
 *
 * After connect, sets `hostConnected` / `hostSendCaps` / `hostConnectError` on the
 * component so Use-this-contract can wait for a live host and check capabilities.
 */
export async function mountKindApp(
  Component: ComponentType<SvelteComponent>,
  kind: string,
  target: HTMLElement = document.body,
): Promise<{ app: App; component: SvelteComponent }> {
  const app = new App({ name: `OpenZeppelin ${kind}`, version: '1.0.0' }, {}, { autoResize: false });

  const component = new Component({
    target,
    props: {
      kind,
      mcpApp: app,
      hostConnected: false,
      hostConnectError: undefined as string | undefined,
      hostSendCaps: { message: false, updateModelContext: false },
    },
  });

  const transport = new PostMessageTransport(window.parent, window.parent);
  void app
    .connect(transport)
    .then(async () => {
      const hostSendCaps = readHostSendCaps(app);
      console.info(`[mcp-apps] connected (${kind}) hostCapabilities`, app.getHostCapabilities());
      component.$set({
        hostConnected: true,
        hostConnectError: undefined,
        hostSendCaps,
      });
      await app.sendSizeChanged({ height: MCP_APP_HEIGHT_PX });
    })
    .catch(err => {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[mcp-apps] connect failed for ${kind}`, err);
      component.$set({
        hostConnected: false,
        hostConnectError: message,
      });
    });

  return { app, component };
}
