import './styles/global.css';

import type {} from 'svelte';
import App from './App.svelte';
import { postMessage } from './post-message';

function postResize() {
  const { height } = document.documentElement.getBoundingClientRect();
  postMessage({ kind: 'oz-wizard-resize', height });
}

window.onload = postResize;

const resizeObserver = new ResizeObserver(postResize);
resizeObserver.observe(document.body);

const tab = new URLSearchParams(window.location.search).get('tab');

const app = new App({ target: document.body, props: { tab } });

app.$on('tab-change', (e: CustomEvent) => {
  postMessage({ kind: 'oz-wizard-tab-change', tab: e.detail.toLowerCase() });
});

export default app;
