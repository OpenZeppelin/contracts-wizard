<script>
  import { createEventDispatcher } from 'svelte';

  export let versionedPage;

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
    if (versionedPage.version) {
      searchParams.push(`version=${versionedPage.version}`);
    }
    dispatch('tab-change', searchParams.join('&'));
  };
</script>

<div class="container overflow-hidden">
  <div class="page-container flex flex-col justify-between overflow-hidden">
    <svelte:component this={versionedPage.page} initialTab={initialTab} initialOpts={initialOpts} bind:tab={contractTab}/>
  </div>
</div>
