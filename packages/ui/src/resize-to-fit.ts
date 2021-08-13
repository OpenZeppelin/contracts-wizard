export function resizeToFit(node: HTMLInputElement) {
  const resize = () => {
    if (node.value === '') {
      return;
    }

    const style = window.getComputedStyle(node);
    const font = ['font-size', 'font-family'].map(p => style.getPropertyValue(p)).join(' ');
    const textWidth = measureTextWidth(node.value, style) + 'px';
    const minWidth = measureTextWidth(node.placeholder, style) + 'px';
    const padding = ['padding-left', 'padding-right', 'border-left-width', 'border-right-width'].map(p => style.getPropertyValue(p));
    const result = `calc(5px + max(${minWidth}, ${textWidth}) + ${padding.join(' + ')})`;
    node.style.setProperty('width', result);
  };

  resize();
  node.addEventListener('input', resize);
}

function measureTextWidth(text: string, style: CSSStyleDeclaration) {
  const font = ['font-size', 'font-family'].map(p => style.getPropertyValue(p)).join(' ');
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.font = font;
  return ctx.measureText(text).width;
}
