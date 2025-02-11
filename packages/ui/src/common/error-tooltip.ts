import tippy, { Props } from 'tippy.js';

const klass = 'has-error';

export function error(node: HTMLElement, content?: string) {
  let shown = false;

  const t = tippy(node, {
    placement: 'right',
    theme: 'light-red border',
    showOnCreate: false,
    onShow: () => { shown = true; },
  });

  t.disable();
  update(content);

  function update(content?: string) {
    if (content) {
      t.setContent(content);

      if (!t.state.isEnabled) {
        shown = false;
        t.enable();
        if (document.activeElement !== node) {
          t.show();
        } else {
          setTimeout(() => {
            if (!shown) {
              t.show();
            }
          }, 1000);
        }
      }

      node.classList.add(klass);
    } else {
      t.disable();
      node.classList.remove(klass);
    }
  }

  return { update };
}
