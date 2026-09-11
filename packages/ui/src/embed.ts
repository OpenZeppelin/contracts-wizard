import type { Message } from './common/post-message';

if (!document.currentScript || !('src' in document.currentScript)) {
  throw new Error('Unknown script URL');
}

const currentScript = new URL(document.currentScript.src);

const iframes = new WeakMap<MessageEventSource, HTMLIFrameElement>();
const mountedIframes = new Set<HTMLIFrameElement>();
const contentHeights = new WeakMap<HTMLIFrameElement, number>();
const unsupportedVersionIframes = new WeakSet<HTMLIFrameElement>();

const unsupportedVersionFrameHeight = 'auto';
const fallbackChromeHeight = 206;
const mobileMediaQuery = window.matchMedia('(max-width: 720px)');

function measureChromeHeight(): number {
  const header = document.querySelector<HTMLElement>('.header.container');
  const banner = document.querySelector<HTMLElement>('.banner');
  const navRow = document.querySelector<HTMLElement>('.nav-row');
  const height = (header?.offsetHeight ?? 0) + (banner?.offsetHeight ?? 0) + (navRow?.offsetHeight ?? 0);
  return height > 0 ? height : fallbackChromeHeight;
}

function applyIframeHeight(iframe: HTMLIFrameElement, contentHeight?: number) {
  if (unsupportedVersionIframes.has(iframe)) {
    iframe.style.height = unsupportedVersionFrameHeight;
    return;
  }
  if (mobileMediaQuery.matches && contentHeight !== undefined) {
    iframe.style.height = `${Math.ceil(contentHeight)}px`;
    return;
  }
  iframe.style.height = `calc(100vh - ${measureChromeHeight()}px)`;
}

function syncIframeHeights() {
  for (const iframe of mountedIframes) {
    applyIframeHeight(iframe, contentHeights.get(iframe));
  }
}

window.addEventListener('message', function (e: MessageEvent<Message>) {
  if (e.source) {
    if (e.data.kind === 'oz-wizard-unsupported-version') {
      const iframe = iframes.get(e.source);
      if (iframe) {
        unsupportedVersionIframes.add(iframe);
        applyIframeHeight(iframe);
      }
    } else if (e.data.kind === 'oz-wizard-resize') {
      const iframe = iframes.get(e.source);
      if (iframe) {
        contentHeights.set(iframe, e.data.height);
        applyIframeHeight(iframe, e.data.height);
      }
    }
  }
});

window.addEventListener('resize', syncIframeHeights);
mobileMediaQuery.addEventListener('change', syncIframeHeights);

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
    iframe.allow = 'clipboard-write';
    applyIframeHeight(iframe);

    w.appendChild(iframe);
    mountedIframes.add(iframe);

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

export {};
