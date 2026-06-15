import test from 'ava';

import { ContractBuilder } from './contract';
import { setInfo } from './set-info';
import type { OptionsError } from './error';

const lineBreaks: [string, string][] = [
  ['LF', '\n'],
  ['CR', '\r'],
  ['CRLF', '\r\n'],
  ['LS', '\u2028'],
  ['PS', '\u2029'],
  ['NEL', '\u0085'],
  ['VT', '\v'],
  ['FF', '\f'],
];

for (const [name, ch] of lineBreaks) {
  test(`setInfo rejects ${name} in securityContact`, t => {
    const c = new ContractBuilder('MyContract');
    const error = t.throws(() => setInfo(c, { securityContact: `security@example.com${ch}contract Injected {}` }));
    t.is((error as OptionsError).messages.securityContact, 'Must not contain line breaks');
  });

  test(`setInfo rejects ${name} in license`, t => {
    const c = new ContractBuilder('MyContract');
    const error = t.throws(() => setInfo(c, { license: `MIT${ch}contract Injected {}` }));
    t.is((error as OptionsError).messages.license, 'Must not contain line breaks');
  });
}

test('setInfo accepts valid single-line values', t => {
  const c = new ContractBuilder('MyContract');
  t.notThrows(() => setInfo(c, { securityContact: 'security@example.com', license: 'MIT' }));
});
