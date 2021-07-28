<script lang="ts">
  import tippy from 'tippy.js';

  import { onMount } from 'svelte';

  export let text = '';

  let target: Element;
  let content: HTMLElement;

  const trigger = (node: Element) => { target = node; };

  onMount(() => {
    tippy(target, { ...$$restProps, content });
    content.style.removeProperty('display');
  });
</script>

<slot {trigger}></slot>

<div style="display: none;" bind:this={content}>
  <slot name="content">{text}</slot>
</div>
