<script lang="ts">
  import { onMount } from 'svelte';
  import { postMessage } from '$lib/post-message';
  import App from '$lib/solidity/App.svelte';

  export let data;

  function postResize() {
    const { height } = document.documentElement.getBoundingClientRect();
    postMessage({ kind: 'oz-wizard-resize', height });
  }

  function postTabChange(e: CustomEvent<string>) {
    postMessage({ kind: 'oz-wizard-tab-change', tab: e.detail });
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

<App on:tab-change={postTabChange} />
