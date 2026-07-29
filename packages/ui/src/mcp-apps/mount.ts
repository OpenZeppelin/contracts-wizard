import { App, PostMessageTransport } from '@modelcontextprotocol/ext-apps';
import type { ComponentType, SvelteComponent } from 'svelte';

/** Stable iframe height for hosts that size from ui/notifications/size-changed. */
export const MCP_APP_HEIGHT_PX = 560;

/**
 * Mount a fixed-kind Wizard MCP App.
 * Component script runs synchronously and registers tool handlers on `mcpApp`
 * before we call `connect()`.
 *
 * autoResize is off: html/body height:100% layouts collapse under the SDK's
 * max-content measurement (ext-apps#143 / #619). We report a fixed height instead.
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
    },
  });

  const transport = new PostMessageTransport(window.parent, window.parent);
  void app
    .connect(transport)
    .then(() => app.sendSizeChanged({ height: MCP_APP_HEIGHT_PX }))
    .catch(err => {
      console.error(`[mcp-apps] connect failed for ${kind}`, err);
    });

  return { app, component };
}
