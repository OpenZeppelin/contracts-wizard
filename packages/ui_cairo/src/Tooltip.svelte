<script lang="ts">
  import tippy, { Instance as TippyInstance } from 'tippy.js';

  import { onMount } from 'svelte';

  export let text = '';
  export let disabled = false;

  let target: Element | undefined;
  let content: HTMLElement;
  let instance: TippyInstance | undefined;

  const trigger = (node: Element) => { target = node; };

  onMount(() => {
    if (target) {
      instance = tippy(target, { ...$$restProps, content });
      content.style.removeProperty('display');
    }
  });

  $: {
    if (instance) {
      if (disabled) {
        instance.disable();
      } else {
        instance.enable();
      }
    }
  }
</script>

<slot {trigger}></slot>

<div style="display: none;" bind:this={content}>
  <slot name="content">{text}</slot>
</div>
