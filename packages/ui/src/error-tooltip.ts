import tippy, { Props } from 'tippy.js';

const klass = 'has-error';

export function error(node: HTMLElement, content?: string) {
  const t = tippy(node, {
    placement: 'right',
    showOnCreate: false,
  });

  update(content);

  function update(content?: string) {
    if (content) {
      t.enable();
      t.setContent(content);
      node.classList.add(klass);
    } else {
      t.disable();
      node.classList.remove(klass);
    }
  }

  return { update };
}
