<script lang="ts">
  import Tooltip from './Tooltip.svelte';

  export let link: string | undefined = undefined;
  export let align: 'right' | undefined = undefined;
  export let placement: 'top' | 'bottom' | 'left' | 'right' = 'right';
</script>

<Tooltip let:trigger interactive placement={placement} theme="light-yellow border" maxWidth="15em">
  <div
    use:trigger
    class="tooltip bg-blue-300 uppercase text-xs font-semibold px-2 py-1 rounded-md text-white hover:bg-blue-400"
    class:ml-auto={align === 'right'}
  >
    ALPHA
  </div>

  <div slot="content">
    <slot></slot>
    {#if link}
      <br>
      <a target="_blank" rel="noopener noreferrer" href={link}>Read more.</a>
    {/if}
  </div>
</Tooltip>
