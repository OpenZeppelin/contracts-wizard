<script lang="ts">
  import '$lib/styles/embed.css';

  import { onMount } from 'svelte';
  import { postMessage } from '$lib/post-message';

  function postResize() {
    const { height } = document.documentElement.getBoundingClientRect();
    postMessage({ kind: 'oz-wizard-resize', height });
  }

  onMount(() => {
    postResize();

    const resizeObserver = new ResizeObserver(postResize);
    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
    };
  });
</script>

<svelte:window on:load={postResize} />

<slot />
