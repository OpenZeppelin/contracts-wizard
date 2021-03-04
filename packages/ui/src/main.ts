import type {} from 'svelte';
import App from './App.svelte';
import { postMessage } from './post-message';

function postResize() {
  postMessage({
    kind: 'oz-wizard-resize',
    height: document.body.scrollHeight,
  });
}

window.onload = postResize;

const resizeObserver = new ResizeObserver(postResize);
resizeObserver.observe(document.body);

export default new App({ target: document.body });
