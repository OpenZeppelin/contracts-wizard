/**
 * Toggles `controls-at-end` on a wizard-panes node when its `.controls`
 * child is scrolled to the bottom (or cannot scroll). Used to hide the
 * bottom fade overlay so the last options are fully visible.
 */
export function scrollFade(node: HTMLElement) {
  const controls = node.querySelector<HTMLElement>('.controls');
  if (!controls) {
    return;
  }

  const update = () => {
    const remaining = controls.scrollHeight - controls.scrollTop - controls.clientHeight;
    node.classList.toggle('controls-at-end', remaining <= 2);
  };

  controls.addEventListener('scroll', update, { passive: true });
  const observer = new ResizeObserver(update);
  observer.observe(controls);
  update();

  return {
    update,
    destroy() {
      controls.removeEventListener('scroll', update);
      observer.disconnect();
    },
  };
}
