<script lang="ts">
  import { fly } from 'svelte/transition';

  const devMode = window.location.href.includes('localhost');

  export let isOpen = false;
  let loaded = false;
  let showIframe = false;

  const handleLoad = () => {
    loaded = true;
  };

  $: if (isOpen) {
    // Show iframe after modal transition (450ms)
    setTimeout(() => {
      showIframe = true;
    }, 450);
  } else {
    showIframe = false;
  }
</script>

{#if isOpen}
  <div 
    class="fixed right-3.5 rounded-r-3xl h-[calc(100vh-84px)] w-[360px] bg-white z-30"
    transition:fly={{x: 380, duration: 450 }}
  >
    <div class="p-2 h-full flex flex-col">
      {#if !loaded}
        <div class="flex justify-center items-center flex-grow">
          Loading...
        </div>
      {/if}
    </div>
  </div>
{/if}

<iframe
  id="defender-deploy"
  title="Defender Deploy"
  src={devMode ? 'http://localhost:5173' : 'https://defender-deploy-wizard.netlify.app/'}
  class={`fixed z-30 right-3.5 w-[360px] h-[calc(100vh-84px)] border-none
    ${!showIframe ? 'invisible' : ''} 
    ${!loaded ? 'hidden' : ''}`}
  on:load={handleLoad}
/>
