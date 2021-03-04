import type { Message } from './post-message';

if (!document.currentScript || !('src' in document.currentScript)) {
  throw new Error('Unknown script URL');
}

const currentScript = new URL(document.currentScript.src);

const iframes = new WeakMap<MessageEventSource, HTMLIFrameElement>();

window.addEventListener('message', function (e: MessageEvent<Message>) {
  if (e.source && e.data.kind === 'oz-wizard-resize') {
    const iframe = iframes.get(e.source);
    if (iframe) {
      iframe.height = e.data.height.toString();
    }
  }
});

document.addEventListener('DOMContentLoaded', function (e) {
  const wizards = document.querySelectorAll<HTMLElement>('oz-wizard');

  for (const w of wizards) {
    w.style.display = 'block';

    const iframe = document.createElement('iframe');
    iframe.src = currentScript.origin + '/embed';
    iframe.style.border = '0';
    iframe.style.width = '100%';

    w.appendChild(iframe);

    if (iframe.contentWindow !== null) {
      iframes.set(iframe.contentWindow, iframe);
    }
  }
});

export {};
