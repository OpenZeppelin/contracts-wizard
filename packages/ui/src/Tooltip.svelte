<script lang="ts">
  export let link: string | undefined = undefined;

  let contentElement: HTMLElement;

  let offset = 0;
  let reverse = false;

  const resetPosition = () => {
    offset = 0;
    reverse = false;
  };

  const adjustPosition = () => {
    const viewportWidth = window.top.document.documentElement.clientWidth;

    const frameRect = window.frameElement?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const contentRect = contentElement.getBoundingClientRect();

    const contentLeft = frameRect.left + contentRect.left;
    const contentRight = frameRect.left + contentRect.right 
    const contentTop = frameRect.top + contentRect.top;

    if (contentLeft < 0) {
      offset -= contentLeft;
    } else if (contentRight > viewportWidth) {
      offset += Math.max(
        viewportWidth - contentRight,
        - contentLeft,
      );
    }

    if (contentTop < 0) {
      reverse = true;
    }
  };
</script>

<span
  class="tooltip"
  class:reverse
  on:mouseenter={adjustPosition}
  on:mouseleave={resetPosition}
>
  <svg style="width:1em;height:1em;" viewBox="0 0 24 24">
    <path fill="currentColor" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"></path>
  </svg>

  <div class="content-container">
    <div class="content" style="--offset: {offset}px" bind:this={contentElement}>
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
    --offset: 0px;
    position: absolute;
    bottom: 0;
    width: 15em;
    transform: translateX(-50%) translateX(var(--offset)) ;
    background-color: var(--yellow-1);
    border: 1px solid rgba(0, 0, 0, .1);
    box-shadow: var(--shadow);
    border-radius: 5px;
    padding: 1em;
    font-size: .9rem;
  }

  .tooltip.reverse {
    flex-direction: column;
  }

  .tooltip.reverse .content {
    bottom: unset;
    top: 0;
  }
</style>
