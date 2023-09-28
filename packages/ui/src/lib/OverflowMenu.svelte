<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';

  import Tooltip from './Tooltip.svelte';
  import MenuDownIcon from './icons/MenuDownIcon.svelte';

  let container: HTMLElement;
  let button: HTMLElement;
  let menu: HTMLElement;

  const getItems = () =>
    Array.from(container.children).filter(
      (c): c is HTMLElement => c instanceof HTMLElement && c !== button && !('tippyRoot' in c.dataset)
    );

  const getMenuItems = () =>
    Array.from(menu.children).filter(
      (c): c is HTMLElement => c instanceof HTMLElement
    );

  const update = () => {
    button.style.order = '-1';

    const items = getItems();
    const menuItems = getMenuItems();

    for (const item of items) {
      item.style.removeProperty('order');
      item.style.removeProperty('visibility');
    }

    const mainRight = Math.round(container.getBoundingClientRect().right);
    const itemsRights = items.map(item => Math.round(item.getBoundingClientRect().right));

    let anyHidden = false;

    for (const [i, item] of items.entries()) {
      const itemRight = itemsRights[i]!;
      const menuItem = menuItems[i];

      if (itemRight > mainRight) {
        item.style.visibility = 'hidden';
        item.style.order = '2';
        anyHidden = true;
        menuItem?.style.removeProperty('display');
      } else {
        item.style.visibility = 'visible';
        item.style.order = '-1';
        if (menuItem) {
          menuItem.style.display = 'none';
        }
      }
    }

    button.style.removeProperty('order');
    button.style.visibility = anyHidden ? 'visible' : 'hidden';
  };

  onMount(() => {
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  });

  afterUpdate(update);
</script>

<!--
  Make it immutable because otherwise afterUpdate gets triggered on every
  resize unnecessarily.
-->
<svelte:options immutable={true} />

<div class="flex overflow-hidden" bind:this={container}>
  <slot overflow={false}></slot>

  <Tooltip let:trigger interactive theme="light border" arrow={false}>
    <button use:trigger bind:this={button} class="overflow-btn" style="order: 1;">
      <MenuDownIcon />
    </button>

    <div slot="content" bind:this={menu} class="flex flex-col overflow-menu">
      <slot overflow={true}></slot>
    </div>
  </Tooltip>
</div>
