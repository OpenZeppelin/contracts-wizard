<script lang="ts">
  import { getContext, onDestroy } from 'svelte';
  import Tooltip from './Tooltip.svelte';
  import { MCP_EXTERNAL_LINKS_CONTEXT, type McpExternalLinksStore } from '../mcp-apps/external-links';

  export let link: string | undefined = undefined;
  export let placement: 'top' | 'bottom' | 'left' | 'right' = 'right';

  // MCP Apps set a writable store; web Wizard leaves context unset and uses normal <a> tags.
  const externalLinks = getContext<McpExternalLinksStore | undefined>(MCP_EXTERNAL_LINKS_CONTEXT);
  const inMcpApp = externalLinks != null;

  // Mirror store into locals so Svelte re-renders when openLinks arrives after connect.
  let canOpenLinks = false;
  let openExternal: (url: string) => Promise<void> = async () => {};

  if (externalLinks) {
    const unsubscribe = externalLinks.subscribe(value => {
      canOpenLinks = value.canOpen;
      openExternal = value.open;
    });
    onDestroy(unsubscribe);
  }

  async function handleReadMore(event: MouseEvent) {
    if (!link || !canOpenLinks) return;
    event.preventDefault();
    try {
      await openExternal(link);
    } catch (e) {
      console.warn('[mcp-apps] Read more openLink failed', e);
    }
  }
</script>

<Tooltip let:trigger interactive {placement} theme="light border" maxWidth="22em">
  <svg use:trigger class="tooltip" style="width: 1rem; height: 1rem;" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"
    ></path>
  </svg>

  <div slot="content">
    <slot></slot>
    {#if link}
      {#if !inMcpApp}
        <br />
        <a target="_blank" rel="noopener noreferrer" href={link}>Read more.</a>
      {:else if canOpenLinks}
        <br />
        <a href={link} on:click={handleReadMore}>Read more.</a>
      {/if}
    {/if}
  </div>
</Tooltip>

<style lang="postcss">
  svg {
    opacity: var(--tooltip-opacity, 1);
    color: var(--text-color);
  }
</style>
