<script lang="ts">
  let element: HTMLElement;
  let active = false;

  interface ShowEvent {
    currentTarget: HTMLElement | null;
  }

  const show = (e: ShowEvent) => {
    active = true;
    e.currentTarget?.focus();
  };

  const handleFocusout = (e: FocusEvent) => {
    if (active && (!e.relatedTarget || !element.contains(e.relatedTarget as Node))) {
      active = false;
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (active && e.key === 'Escape') {
      active = false;
    }
  };
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="dropdown" bind:this={element} on:focusout={handleFocusout}>
  <slot name="button" {show}></slot>

  <div class="dropdown-items" class:active>
    <slot></slot>
  </div>
</div>

<style>
  .dropdown {
    position: relative;
  }

  .dropdown-items {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: var(--size-1);
    width: var(--size-64);
    display: flex;
    flex-direction: column;
    background-color: white;
    box-shadow: var(--shadow);
    border-radius: 5px;
    border: 1px solid var(--gray-2);
  }

  .dropdown-items:not(.active) {
    display: none;
  }
</style>
