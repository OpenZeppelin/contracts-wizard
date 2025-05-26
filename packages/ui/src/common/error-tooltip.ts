import tippy from 'tippy.js';

const klass = 'has-error';

export function error(node: HTMLElement, initialError?: string) {
  const t = tippy(node, {
    placement: 'right',
    theme: 'light-red border',
    trigger: 'manual',
    hideOnClick: false,
    interactive: true,
  });

  function update(newError?: string) {
    if (newError) {
      t.setContent(newError);
      t.show();
      node.classList.add(klass);
    } else {
      t.hide();
      node.classList.remove(klass);
    }
  }

  update(initialError);

  return {
    update,
    destroy: t.destroy,
  };
}
