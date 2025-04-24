import type { Message } from './common/post-message';

if (!document.currentScript || !('src' in document.currentScript)) {
  throw new Error('Unknown script URL');
}

const currentScript = new URL(document.currentScript.src);

const iframes = new WeakMap<MessageEventSource, HTMLIFrameElement>();

let unsupportedVersion: boolean = false;
const unsupportedVersionFrameHeight = 'auto';

const iframeHeightDiff = '206px';

window.addEventListener('message', function (e: MessageEvent<Message>) {
  if (e.source) {
    if (e.data.kind === 'oz-wizard-unsupported-version') {
      unsupportedVersion = true;
      const iframe = iframes.get(e.source);
      if (iframe) {
        iframe.style.height = unsupportedVersionFrameHeight;
      }
    } else if (e.data.kind === 'oz-wizard-resize') {
      const iframe = iframes.get(e.source);
      if (iframe) {
        iframe.style.height = unsupportedVersion ? unsupportedVersionFrameHeight : `calc(100vh - ${iframeHeightDiff})`;
      }
    }
  }
});

onDOMContentLoaded(function () {
  const wizards = document.querySelectorAll<HTMLElement>('oz-wizard');

  for (const w of wizards) {
    w.style.display = 'block';

    const src = new URL('embed', currentScript.origin);

    setSearchParam(w, src.searchParams, 'data-lang', 'lang');
    setSearchParam(w, src.searchParams, 'data-tab', 'tab');
    setSearchParam(w, src.searchParams, 'version', 'version');

    const sync = w.getAttribute('data-sync-url');

    if (sync === 'fragment') {
      // Uses format: #tab&key=value&key=value...
      const fragments = window.location.hash.replace('#', '').split('&');
      for (const fragment of fragments) {
        const [key, value] = fragment.split('=', 2);
        if (key && value) {
          src.searchParams.set(key, value);
        } else {
          src.searchParams.set('tab', fragment);
        }
      }
    }

    const iframe = document.createElement('iframe');
    iframe.src = src.toString();
    iframe.style.display = 'block';
    iframe.style.border = '0';
    iframe.style.width = '100%';
    iframe.style.height = `calc(100vh - ${iframeHeightDiff} )`;
    iframe.allow = 'clipboard-write';

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

function setSearchParam(w: HTMLElement, searchParams: URLSearchParams, dataParam: string, param: string) {
  const value = w.getAttribute(dataParam) ?? w.getAttribute(param);
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

export { };
