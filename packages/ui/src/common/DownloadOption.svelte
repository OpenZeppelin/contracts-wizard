<script lang="ts">
  import DownloadIcon from './icons/DownloadIcon.svelte';

  export let title: string;
</script>

<button class="download-option" on:click>
  <span class="type-icon">
    <slot name="icon"></slot>
  </span>
  <span class="copy">
    <span class="title">{title}</span>
    {#if $$slots.description}
      <span class="description">
        <slot name="description"></slot>
      </span>
    {/if}
  </span>
  <span class="action">
    <DownloadIcon />
  </span>
</button>

<style lang="postcss">
  .download-option {
    display: flex;
    align-items: center;
    width: 100%;
    gap: var(--size-3);
    padding: var(--size-2);
    color: var(--gray-6);
    text-align: left;
    background: none;
    border: 1px solid transparent;
    border-top-color: var(--gray-2);
    border-radius: 4px;
    cursor: pointer;
  }

  .download-option:first-child {
    border-top-color: transparent;
  }

  .download-option:hover,
  .download-option:focus {
    background-color: var(--gray-1);
    border: 1px solid var(--gray-3);
  }

  .type-icon,
  .action {
    display: flex;
    flex: none;
    align-items: center;
  }

  .type-icon :global(.icon),
  .action :global(.icon) {
    margin-top: 0;
  }

  .copy {
    flex: 1;
    min-width: 0;
  }

  .title {
    display: block;
    font-size: var(--text-small);
    font-weight: bold;
  }

  .description {
    display: block;
    margin-top: var(--size-1);
    color: var(--gray-5);
    font-size: var(--text-small);
  }

  .action {
    color: var(--gray-4);
  }

  .download-option:hover .action,
  .download-option:focus .action {
    color: var(--gray-6);
  }
</style>
