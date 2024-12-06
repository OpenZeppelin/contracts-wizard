<script lang="ts">
  import { fly } from 'svelte/transition';

  const devMode = window.location.href.includes('localhost');

  export let isOpen = false;

  let loaded = false;

  const handleLoad = () => {
    loaded = true;
  };
</script>

{#if isOpen}
  <div 
    class="fixed right-0 h-[calc(100vh-84px)] w-[360px] bg-white z-40"
    transition:fly={{ x: 360, duration: 200 }}
  >
    <div class="p-2 h-full flex flex-col">
      {#if !loaded}
        <div class="flex justify-center items-center flex-grow">
          Loading...
        </div>
      {/if}

      <iframe
        id="defender-deploy"
        title="Defender Deploy"
        src={devMode ? 'http://localhost:5173' : 'https://defender-deploy-wizard.netlify.app/'}
        class={`flex-grow border-none mt-10 ${!loaded ? 'hidden' : ''}`}
        on:load={handleLoad}
      />
    </div>
  </div>
{/if}