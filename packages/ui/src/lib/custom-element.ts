import type { Message } from './post-message';

export function installCustomElement() {
  const currentScriptSrc = (document.currentScript as HTMLScriptElement | null)?.src ?? import.meta.url;

  if (!currentScriptSrc) {
    throw new Error('Unknown script URL');
  }

  const currentScript = new URL(currentScriptSrc);

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
      w.style.minHeight = '53rem';

      const lang = getAttribute(w, 'data-lang', 'lang') ?? 'solidity';

      const src = new URL(`embed/${lang}`, currentScript.origin);

      setSearchParam(w, src.searchParams, 'data-tab', 'tab');
      const sync = w.getAttribute('data-sync-url');

      if (sync === 'fragment') {
        const fragment = window.location.hash.replace('#', '');
        if (fragment) {
          src.searchParams.set('tab', fragment);
        }
      }

      const iframe = document.createElement('iframe');
      iframe.src = src.toString();
      iframe.style.display = 'block';
      iframe.style.border = '0';
      iframe.style.width = '100%';
      iframe.style.height = '53rem';

      w.appendChild(iframe);

      if (iframe.contentWindow !== null) {
        iframes.set(iframe.contentWindow, iframe);
      }

      if (sync === 'fragment') {
        window.addEventListener('message', (e: MessageEvent<Message>) => {
          if (e.source && e.data.kind === 'oz-wizard-tab-change') {
            if (iframe === iframes.get(e.source)) {
              window.location.hash = e.data.tab;
            }
          }
        });
      }
    }
  });

}

function getAttribute(w: HTMLElement, dataParam: string, param: string) {
  return w.getAttribute(dataParam) ?? w.getAttribute(param);
}

function setSearchParam(w: HTMLElement, searchParams: URLSearchParams, dataParam: string, param: string) {
  const value = getAttribute(w, dataParam, param);
  if (value) {
    searchParams.set(param, value);
  }
}

function onDOMContentLoaded(callback: () => void) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}
