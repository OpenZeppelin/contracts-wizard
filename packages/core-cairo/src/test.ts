import test from 'ava';

import { generateSources } from './generate/sources';
import type { GenericOptions } from './build-generic';
import { custom, erc20, erc721 } from './api';

function isAccessControlRequired(opts: GenericOptions) {
  switch(opts.kind) {
    case 'ERC20':
      return erc20.isAccessControlRequired(opts);
    case 'ERC721':
      return erc721.isAccessControlRequired(opts);
    case 'Custom':
      return custom.isAccessControlRequired(opts);
    default:
      throw new Error("No such kind");
  }
}

test('is access control required', async t => {
  for (const contract of generateSources('all')) {
    const regexOwnable = /(from openzeppelin.access.ownable import Ownable)/gm;

    if (!contract.options.access) {
      if (isAccessControlRequired(contract.options)) {
        t.regex(contract.source, regexOwnable, JSON.stringify(contract.options));
      } else {
        t.notRegex(contract.source, regexOwnable, JSON.stringify(contract.options));
      }
    }
  }
});