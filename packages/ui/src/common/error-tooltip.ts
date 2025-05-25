import tippy from 'tippy.js';

const klass = 'has-error';

export function error(node: HTMLElement, content?: string) {
  const t = tippy(node, {
    placement: 'right',
    theme: 'light-red border',
    trigger: 'manual',
    hideOnClick: false,
  });

  function update(contentToUpdate?: string) {
    console.log({ content, contentToUpdate, node });
    if (contentToUpdate) {
      t.setContent(contentToUpdate);
      t.show();
      node.classList.add(klass);
    } else {
      t.hide();
      node.classList.remove(klass);
    }
  }

  update(content);

  return { update };
}
