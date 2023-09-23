<script lang="ts">
  import { postMessage } from '$lib/post-message';
  import App from '$lib/cairo/App.svelte';

  function postTabChange(e: CustomEvent<string>) {
    postMessage({ kind: 'oz-wizard-tab-change', tab: e.detail });
  }
</script>

<App on:tab-change={postTabChange} />
