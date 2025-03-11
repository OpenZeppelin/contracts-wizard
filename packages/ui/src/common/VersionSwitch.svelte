<script>
  import { createEventDispatcher } from 'svelte';

  export let left;
  export let right;
  export let defaultPage = 'left';

  // For passing through to the page
  export let initialTab;
  export let initialOpts;

  let tab = defaultPage === 'left' ? left : right;

  function switchTo(page) {
    tab = page;
  }

  const dispatch = createEventDispatcher();

  let contractTab;

  $: {
    const searchParams = [];
    if (contractTab) {
      searchParams.push(contractTab);
    }
    if (tab.version) {
      searchParams.push(`version=${tab.version}`);
    }
    dispatch('tab-change', searchParams.join('&'));
  };
</script>

<div class="container overflow-hidden">
  <div class="header flex flex-row justify-between overflow-hidden">
    <div class="button-container">
      <button class:selected={tab === left} on:click={() => switchTo(left)}>
        {left.label}
      </button>
      <button class:selected={tab === right} on:click={() => switchTo(right)}>
        {right.label}
      </button>
    </div>
  </div>
  <div class="page-container flex flex-col justify-between overflow-hidden">
    <svelte:component this={tab.page} initialTab={initialTab} initialOpts={initialOpts} bind:tab={contractTab}/>
  </div>
</div>

<style lang="postcss">
  .container {
    min-width: 32rem;
  }

  .button-container {
    height: 36px;
    margin-left: 0;
    margin-right: 0;
    margin-top: 0;
    margin-bottom: 4px;
    font-size: 0;
    color: var(--gray-5);
    background-color: black;
    display: inline-block;
    border: 1px solid var(--gray-4);
    border-radius: 6px;
    padding: 0px;
    overflow: hidden;
  }

  .button-container button, :global(.overflow-btn) {
    font-size: 16px;
    height: 100%;
    padding: 0 var(--size-3);
    border-radius: 0px;
    cursor: pointer;
    transition: none;
    border: none;
    margin: 0;
    box-sizing: border-box;
  }

  .button-container button, :global(.overflow-btn) {
    border: 0;
    background-color: var(--gray-1);
  }

  .button-container button:hover, :global(.overflow-btn):hover {
    background-color: var(--gray-2);
  }

  .button-container button.selected {
    background-color: var(--blue-2);
    color: white;
    order: -1;
  }

</style>
