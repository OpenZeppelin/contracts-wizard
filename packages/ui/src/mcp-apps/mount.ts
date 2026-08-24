import './styles';
import { App, PostMessageTransport } from '@modelcontextprotocol/ext-apps';
import type { SvelteComponent } from 'svelte';
import KindApp from './KindApp.svelte';
import type { KindAdapter } from './adapter';
import { readHostSendCaps } from './deliver-contract';
import { MCP_KIND_PLACEHOLDER } from './kind-placeholder';

/** Stable iframe height for hosts that size from ui/notifications/size-changed. */
export const MCP_APP_HEIGHT_PX = 560;

type AdapterKind<Adapter extends KindAdapter> = Extract<keyof Adapter['controls'], string>;

/**
 * Mount a language MCP App entry. Bundles every kind for the language; the kind argument is the
 * build-time placeholder `__OZ_MCP_KIND__`, which packages/mcp replaces with the tool's real kind
 * at serve time. Prefer this over `mountKindApp` in `entries/*.ts`.
 */
export function mountLanguageApp<Adapter extends KindAdapter>(
  adapter: Adapter,
  target: HTMLElement = document.body,
): Promise<{ app: App; component: SvelteComponent }> {
  // TypeScript needs a real AdapterKind here; any key is fine — only the runtime string matters,
  // and that remains MCP_KIND_PLACEHOLDER until serve-time injection.
  return mountKindApp(adapter, MCP_KIND_PLACEHOLDER as AdapterKind<Adapter>, target);
}

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
export async function mountKindApp<Adapter extends KindAdapter>(
  adapter: Adapter,
  // Adapters are declared with `satisfies KindAdapter`, so their `controls` keys stay literal and
  // a kind this language does not have is a compile error rather than a blank controls pane.
  kind: AdapterKind<Adapter>,
  target: HTMLElement = document.body,
): Promise<{ app: App; component: SvelteComponent }> {
  const app = new App({ name: `OpenZeppelin ${kind}`, version: '1.0.0' }, {}, { autoResize: false });

  // Single source of truth for the height we also report to the host below.
  document.documentElement.style.setProperty('--mcp-app-height', `${MCP_APP_HEIGHT_PX}px`);

  const component = new KindApp({
    target,
    props: { adapter, kind, mcpApp: app },
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
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[mcp-apps] connect failed for ${kind}`, err);
      component.$set({
        hostConnected: false,
        hostConnectError: message,
      });
    });

  return { app, component };
}
