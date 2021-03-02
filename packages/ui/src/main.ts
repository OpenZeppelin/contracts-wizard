import '@csstools/normalize.css';

import type {} from 'svelte';
import App from './App.svelte';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing container element (div#app)');
}

export default new App({ target: target });
