import './styles/global.css';

import type {} from 'svelte';
import App from './App.svelte';
import CairoApp from './cairo/App.svelte';
import { postMessage } from './post-message';
import UnsupportedVersion from './UnsupportedVersion.svelte';
import semver from 'semver';
import { compatibleContractsSemver as compatibleSolidityContractsSemver } from '@openzeppelin/wizard';
import { compatibleContractsSemver as compatibleCairoContractsSemver } from '@openzeppelin/wizard-cairo';
import type { InitialOptions } from './initial-options';

function postResize() {
  const { height } = document.documentElement.getBoundingClientRect();
  postMessage({ kind: 'oz-wizard-resize', height });
}

window.onload = postResize;

const resizeObserver = new ResizeObserver(postResize);
resizeObserver.observe(document.body);

const params = new URLSearchParams(window.location.search);

const initialTab = params.get('tab') ?? undefined;
const lang = params.get('lang') ?? undefined;
const requestedVersion = params.get('version') ?? undefined;

const initialOpts: InitialOptions = {
  name: params.get('name') ?? undefined,
  symbol: params.get('symbol') ?? undefined,
  premint: params.get('premint') ?? undefined,
}

let compatibleVersionSemver = lang === 'cairo' ? compatibleCairoContractsSemver : compatibleSolidityContractsSemver;

let app;
if (requestedVersion && !semver.satisfies(requestedVersion, compatibleVersionSemver)) {
  postMessage({ kind: 'oz-wizard-unsupported-version' });
  app = new UnsupportedVersion({ target: document.body, props: { requestedVersion, compatibleVersionSemver }});
} else if (lang === 'cairo') {
  app = new CairoApp({ target: document.body, props: { initialTab, initialOpts } });
} else {
  app = new App({ target: document.body, props: { initialTab, initialOpts } });
}

app.$on('tab-change', (e: CustomEvent) => {
  postMessage({ kind: 'oz-wizard-tab-change', tab: e.detail.toLowerCase() });
});

export default app;

