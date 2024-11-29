<script lang="ts">
  export let isOpen = false;
  export let onClose = () => {};

  // TODO: use flag to determine if we are in dev mode, and set the local url accordingly.
  const defenderDeployUrl = 'https://defeder-remix-deploy.netlify.app/';
  let loaded = false;

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
</script>

<svelte:window on:keydown={handleEscape}/>

{#if isOpen}
  <div 
    class="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center"
    on:click={onClose}
    on:keydown={() => {}}
  >
    <div 
      class="bg-white rounded-lg p-6 max-w-lg w-full mx-4 z-50"
      on:click|stopPropagation
      on:keydown={() => {}}
    >
      <div class="flex flex-col gap-4">
        <h2 class="text-xl font-bold">Deploy with Defender</h2>
        {#if !loaded}
          <div class="flex justify-center items-center h-[400px]">
            loading...
          </div>
        {/if}
        <iframe 
          title="Defender Remix Deploy" 
          class={!loaded ? 'hidden' : 'h-[400px]'} 
          on:load={() => loaded = true} 
          src={defenderDeployUrl} 
          frameborder="0"
        ></iframe>
        <button
          class="cursor-pointer px-4 py-2 rounded self-end font-semibold"
          on:click={onClose}
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}