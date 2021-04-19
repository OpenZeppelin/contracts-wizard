<script lang="ts">
  let dropdownElement: HTMLElement;
  let active = false;

  const handleFocusout = (e: FocusEvent) => {
    if (active && (!e.relatedTarget || !dropdownElement.contains(e.relatedTarget as Node))) {
      active = false;
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (e.target instanceof Element && e.target.matches('[slot="button"]')) {
      active = !active;
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (active && e.key === 'Escape') {
      active = false;
    }
  };
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="dropdown" bind:this={dropdownElement} on:focusout={handleFocusout} on:click={handleClick}>
  <slot name="button"></slot>

  <div class="dropdown-items" class:active>
    <slot {active}></slot>
  </div>
</div>

<style lang="postcss">
  .dropdown {
    position: relative;
  }

  .dropdown-items {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: var(--size-1);
    width: 20rem;
    display: flex;
    flex-direction: column;
    background-color: white;
    box-shadow: var(--shadow);
    border-radius: 5px;
    border: 1px solid var(--gray-2);
    padding: var(--size-1);
  }

  .dropdown-items:not(.active) {
    display: none;
  }
</style>
