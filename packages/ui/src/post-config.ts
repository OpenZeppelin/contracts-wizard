import type { GenericOptions } from '@openzeppelin/wizard';
import type { GenericOptions as CairoOptions } from 'core-cairo';
import { v4 as uuid } from 'uuid';

const instance = uuid();

export type Action = 'copy' | 'remix' | 'download-npm' | 'download-vendored';
export type Language = 'solidity' | 'cairo';

// NOTE: We have to make sure any fields sent in the body are defined in the
// hidden form in public/index.html.
export async function postConfig(opts: Required<GenericOptions> | Required<CairoOptions>, action: Action, language: Language) {
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
      language
    }),
  });
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
