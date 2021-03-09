import type { ERC20Options } from '@openzeppelin/wizard';
import { v4 as uuid } from 'uuid';

const instance = uuid();

export type Action = 'copy';

// NOTE: We have to make sure any fields sent in the body are defined in the
// hidden form in public/index.html.
export async function postConfig(opts: Required<ERC20Options>, action: Action) {
  await fetch('/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: encode({
      'form-name': 'config',
      instance,
      data: JSON.stringify(opts),
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
