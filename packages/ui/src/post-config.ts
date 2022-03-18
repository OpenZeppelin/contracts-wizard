import type { GenericOptions } from '@openzeppelin/wizard';
import { v4 as uuid } from 'uuid';

declare global {
  interface Window {
    gtag(...args: unknown[]): void;
  }
}
const instance = uuid();

export type Action = 'copy' | 'remix' | 'download-npm' | 'download-vendored';

// NOTE: We have to make sure any fields sent in the body are defined in the
// hidden form in public/index.html.
export async function postConfig(opts: Required<GenericOptions>, action: Action) {
  console.log("running postConfig... ");
  sendAnalyticsToGTM(opts, action);
  await fetch('/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: encode({
      'form-name': 'config',
      instance,
      action,
      data: JSON.stringify(opts),
    }),
  });
}
function sendAnalyticsToGTM(opts: any, action : Action){
  console.log("sendAnalyticsToGTM..." + JSON.stringify(opts));
  var currentObject = opts;
  
  if (typeof window.gtag === 'undefined') {
    console.log("no GTAG found --- undefined");
    return;
  } 
   
  opts.action = action;
  console.log("opts summary : " + JSON.stringify(opts));
  window.gtag("event", "wizard_action", opts);
}
function encode<K extends string, V extends string | number | boolean>(
  data: Record<K, V>,
): string {
  const components = [];
  for (const key in data) {
    components.push(
      encodeURIComponent(key) + '=' + encodeURIComponent(data[key]),
    );
  }
  return components.join('&');
}
