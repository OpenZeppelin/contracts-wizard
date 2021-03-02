<script lang="ts">
  export let path: string;
</script>

<span class="icon">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d={path}></path>
  </svg>
  <slot />
</span>

<style>
  .icon {
    display: flex;
    align-items: center;
  }

  .icon svg {
    flex-shrink: 0;
    height: 1em;
    width: 1em;
    margin-right: .3em;
    fill: currentColor;
  }
</style>
