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
      iframe.style.height = Math.ceil(e.data.height).toString() + 'px';
    }
  }
});

onDOMContentLoaded(function () {
  const wizards = document.querySelectorAll<HTMLElement>('oz-wizard');

  for (const w of wizards) {
    w.style.display = 'block';
    w.style.minHeight = '40rem';

    const iframe = document.createElement('iframe');
    iframe.src = currentScript.origin + '/embed';
    iframe.style.display = 'block';
    iframe.style.border = '0';
    iframe.style.width = '100%';
    iframe.style.height = '40rem';

    w.appendChild(iframe);

    if (iframe.contentWindow !== null) {
      iframes.set(iframe.contentWindow, iframe);
    }
  }
});

function onDOMContentLoaded(callback: () => void) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

export {};
