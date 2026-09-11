/**
 * Toggles `controls-at-end` on a wizard-panes node when its `.controls`
 * child is scrolled to the bottom (or cannot scroll). Used to hide the
 * bottom fade overlay so the last options are fully visible.
 */
export function scrollFade(node: HTMLElement, _dep?: unknown) {
  const controls = node.querySelector<HTMLElement>('.controls');
  if (!controls) {
    return;
  }

  const update = () => {
    const remaining = controls.scrollHeight - controls.scrollTop - controls.clientHeight;
    node.classList.toggle('controls-at-end', remaining <= 2);
    node.style.setProperty('--controls-fade-width', `${controls.offsetWidth}px`);
  };

  controls.addEventListener('scroll', update, { passive: true });
  const resizeObserver = new ResizeObserver(update);
  resizeObserver.observe(controls);
  const mutationObserver = new MutationObserver(update);
  mutationObserver.observe(controls, { childList: true, subtree: true });
  update();

  return {
    update,
    destroy() {
      controls.removeEventListener('scroll', update);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    },
  };
}
