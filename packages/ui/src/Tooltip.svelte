<script lang="ts">
  import { onMount } from 'svelte';

  export let link: string | undefined;

  let tooltipElement, contentElement;

  let reverse = false;

  const translate = (distance) => {
    contentElement.style.transform = [
      window.getComputedStyle(contentElement).transform,
      `translateX(${distance}px)`,
    ].join(' ');
  };

  const reposition = () => {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const contentRect = contentElement.getBoundingClientRect();

    if (contentRect.left < 0) {
      translate(- contentRect.left);
    }

    if (contentRect.right > viewportWidth) {
      translate(
        Math.max(
          viewportWidth - contentRect.right,
          - contentRect.left,
        ),
      );
    }

    if (contentRect.top < 0) {
      reverse = true;
    }
  };
</script>

<span
  class="tooltip"
  class:reverse
  bind:this={tooltipElement}
  on:mouseenter={reposition}
  on:mouseleave={() => reverse = false}
>
  <svg style="width:1em;height:1em;" viewBox="0 0 24 24">
    <path fill="currentColor" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"></path>
  </svg>

  <div class="content-container">
    <div class="content" bind:this={contentElement}>
      <slot></slot>
      {#if link}
        <a target="_top" href={link}>Read more.</a>
      {/if}
    </div>
  </div>
</span>

<style>
  .tooltip {
    display: inline-flex;
    flex-direction: column-reverse;
    align-items: center;
    justify-content: center;
  }

  .content-container {
    display: none;
    position: relative;
  }

  .tooltip:hover .content-container {
    display: block;
  }

  .content {
    position: absolute;
    bottom: 0;
    width: 15em;
    transform: translateX(-50%);
    background-color: var(--yellow-1);
    border: 1px solid rgba(0, 0, 0, .1);
    box-shadow: var(--shadow);
    border-radius: 5px;
    padding: 1em;
    font-size: .9em;
  }

  .tooltip.reverse {
    flex-direction: column;
  }

  .tooltip.reverse .content {
    bottom: unset;
    top: 0;
  }
</style>
