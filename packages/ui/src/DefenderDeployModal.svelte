<script lang="ts">
  import { fly } from 'svelte/transition';

  export let isOpen = false;

  let loaded = false;

  const handleLoad = () => {
    loaded = true;
  };
</script>

{#if isOpen}
  <div 
    class="fixed right-0 h-[calc(100vh-84px)] w-[500px] bg-white z-40"
    transition:fly={{ x: 500, duration: 200 }}
  >
    <div class="p-6 h-full flex flex-col">
      {#if !loaded}
        <div class="flex justify-center items-center flex-grow">
          Loading...
        </div>
      {/if}

      <iframe 
        title="Defender Deploy"
        src="https://defender-deploy-wizard.netlify.app/"
        class={`flex-grow border-none ${!loaded ? 'hidden' : ''}`}
        on:load={handleLoad}
      />
    </div>
  </div>
{/if}