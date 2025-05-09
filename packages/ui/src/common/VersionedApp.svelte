<script>
  import { createEventDispatcher } from 'svelte';

  export let isDefaultVersion = false;
  export let version;
  export let page;

  // For passing through to the page
  export let initialTab;
  export let initialOpts;

  const dispatch = createEventDispatcher();

  let contractTab;

  $: {
    const searchParams = [];
    if (contractTab) {
      searchParams.push(contractTab);
    }
    if (!isDefaultVersion) {
      searchParams.push(`version=${version}`);
    }
    dispatch('tab-change', searchParams.join('&'));
  }
</script>

<div class="container overflow-hidden">
  <div class="page-container flex flex-col justify-between overflow-hidden">
    <svelte:component this={page} {initialTab} {initialOpts} bind:tab={contractTab} />
  </div>
</div>
