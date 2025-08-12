import './common/styles/global.css';

import SolidityApp from './solidity/App.svelte';
import CairoApp from './cairo/App.svelte';
import CairoAlphaApp from './cairo_alpha/App.svelte';
import StellarApp from './stellar/App.svelte';
import StylusApp from './stylus/App.svelte';
import VersionedApp from './common/VersionedApp.svelte';
import { postMessage } from './common/post-message';
import UnsupportedVersion from './common/UnsupportedVersion.svelte';
import semver from 'semver';
import { compatibleContractsSemver as soliditySemver } from '@openzeppelin/wizard';
import { compatibleContractsSemver as cairoSemver, contractsVersion as cairoVersion } from '@openzeppelin/wizard-cairo';
import {
  compatibleContractsSemver as cairoAlphaSemver,
  contractsVersion as cairoAlphaVersion,
} from '@openzeppelin/wizard-cairo-alpha';
import { compatibleContractsSemver as stellarSemver } from '@openzeppelin/wizard-stellar';
import { compatibleContractsSemver as stylusSemver } from '@openzeppelin/wizard-stylus';
import type { InitialOptions } from './common/initial-options';

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
};

interface CompatibleSelection {
  compatible: true;
  appType: 'solidity' | 'cairo' | 'cairo_alpha' | 'stellar' | 'stylus';
}

interface IncompatibleSelection {
  compatible: false;
  compatibleVersionsSemver: string;
}

/**
 * Evaluates which app should be selected based on the language and requested version.
 * If `requestedVersion` is provided, determines and selects a compatible app, or returns an incompatible selection if none is found to be compatible.
 * If `requestedVersion` is undefined, a stable version is selected and the app is compatible.
 *
 * @param lang The requested language
 * @param requestedVersion The requested version
 * @returns A compatible selection with the app type, or an incompatible selection with the compatible semver range
 */
function evaluateSelection(
  lang: string | undefined,
  requestedVersion: string | undefined,
): CompatibleSelection | IncompatibleSelection {
  switch (lang) {
    case 'cairo': {
      if (requestedVersion === undefined) {
        return { compatible: true, appType: 'cairo' };
      } else if (
        requestedVersion === 'alpha' ||
        (semver.satisfies(requestedVersion, cairoAlphaSemver) && (cairoVersion as string) !== (cairoAlphaVersion as string))
      ) {
        return { compatible: true, appType: 'cairo_alpha' };
      } else if (requestedVersion === 'stable' || semver.satisfies(requestedVersion, cairoSemver)) {
        return { compatible: true, appType: 'cairo' };
      } else {
        return { compatible: false, compatibleVersionsSemver: `${cairoAlphaSemver} || ${cairoSemver}` };
      }
    }
    case 'stellar': {
      if (requestedVersion === undefined || semver.satisfies(requestedVersion, stellarSemver)) {
        return { compatible: true, appType: 'stellar' };
      } else {
        return { compatible: false, compatibleVersionsSemver: stellarSemver };
      }
    }
    case 'stylus': {
      if (requestedVersion === undefined || semver.satisfies(requestedVersion, stylusSemver)) {
        return { compatible: true, appType: 'stylus' };
      } else {
        return { compatible: false, compatibleVersionsSemver: stylusSemver };
      }
    }
    case 'solidity':
    case undefined:
    default: {
      if (requestedVersion === undefined || semver.satisfies(requestedVersion, soliditySemver)) {
        return { compatible: true, appType: 'solidity' };
      } else {
        return { compatible: false, compatibleVersionsSemver: soliditySemver };
      }
    }
  }
}

let app;
const selection = evaluateSelection(lang, requestedVersion);

if (!selection.compatible) {
  if (requestedVersion === undefined) {
    // Should never happen, since undefined should lead to a compatible selection
    throw new Error('requestedVersion is undefined');
  }

  postMessage({ kind: 'oz-wizard-unsupported-version' });
  app = new UnsupportedVersion({
    target: document.body,
    props: { requestedVersion: requestedVersion, compatibleVersionSemver: selection.compatibleVersionsSemver },
  });
} else {
  switch (selection.appType) {
    case 'cairo':
      app = new VersionedApp({
        target: document.body,
        props: {
          isDefaultVersion: true,
          version: 'stable',
          page: CairoApp,
          initialTab,
          initialOpts,
        },
      });
      break;
    case 'cairo_alpha':
      app = new VersionedApp({
        target: document.body,
        props: {
          isDefaultVersion: false,
          version: 'alpha',
          page: CairoAlphaApp,
          initialTab,
          initialOpts,
        },
      });
      break;
    case 'stellar':
      app = new StellarApp({ target: document.body, props: { initialTab, initialOpts } });
      break;
    case 'stylus':
      app = new StylusApp({ target: document.body, props: { initialTab, initialOpts } });
      break;
    case 'solidity':
      app = new SolidityApp({
        target: document.body,
        props: { initialTab, initialOpts },
      });
      break;
    default: {
      const _: never = selection.appType;
      throw new Error('Unknown app type');
    }
  }
}

app.$on('tab-change', (e: CustomEvent) => {
  postMessage({ kind: 'oz-wizard-tab-change', tab: e.detail.toLowerCase() });
});

export default app;
