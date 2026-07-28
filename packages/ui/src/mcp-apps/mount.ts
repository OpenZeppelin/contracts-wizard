import { App, PostMessageTransport } from '@modelcontextprotocol/ext-apps';
import type { ComponentType, SvelteComponent } from 'svelte';

/**
 * Mount a fixed-kind Wizard MCP App.
 * Component script runs synchronously and registers tool handlers on `mcpApp`
 * before we call `connect()`.
 */
export async function mountKindApp(
  Component: ComponentType<SvelteComponent>,
  kind: string,
  target: HTMLElement = document.body,
): Promise<{ app: App; component: SvelteComponent }> {
  const app = new App({ name: `OpenZeppelin ${kind}`, version: '1.0.0' });

  const component = new Component({
    target,
    props: {
      kind,
      mcpApp: app,
    },
  });

  const transport = new PostMessageTransport(window.parent, window.parent);
  await app.connect(transport);
  return { app, component };
}
