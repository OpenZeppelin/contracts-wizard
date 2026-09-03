import test from 'ava';
import { containsNonAscii, tronIdeURL } from './tron-ide';

// Decoder used in TRON IDE (a Remix 0.16-era fork, https://github.com/tronweb3/TronIDE):
// hash params are read raw — split on '&' and the first '=' with NO url-decoding
// (apps/remix-ide/src/lib/query-params.js) — and `code` is decoded with plain
// atob (apps/remix-ide/src/app/panels/file-panel.js). Unlike Remix, there is no
// decodeURIComponent and no UTF-8 TextDecoder pass.
const decodeTronIde = (rawPayload: string) => atob(rawPayload);

// Parses the hash the way TRON IDE's QueryParams does.
const getRawHashParams = (url: URL) => {
  const params = new Map<string, string>();
  for (const part of url.hash.replace(/^#/, '').split('&')) {
    const eqIndex = part.indexOf('=');
    params.set(part.substring(0, eqIndex), part.substring(eqIndex + 1));
  }
  return params;
};

test('tronIdeURL encodes code param decodable by decodeTronIde', t => {
  const contractSource = 'contract A{}';

  const url = tronIdeURL(contractSource);
  t.is(url.origin, 'https://tronide.io');

  const codeParam = getRawHashParams(url).get('code');
  t.truthy(codeParam, 'Expected code hash param to be set');

  t.is(decodeTronIde(codeParam!), contractSource, 'Decoded code should equal original source');
});

test('tronIdeURL leaves base64 unencoded in the hash', t => {
  // 'ab>' base64-encodes to 'YWI+' and 'ab?' to 'YWI/': a '>' or '?' on the
  // third byte of a group is how '+' and '/' appear in base64 of ASCII source
  // (e.g. `=>` mappings, `>=`, ternaries). URLSearchParams would percent-encode
  // them, which makes TRON IDE's raw atob throw and load nothing.
  const contractSource = 'ab>ab?';

  const url = tronIdeURL(contractSource);
  const codeParam = getRawHashParams(url).get('code');

  t.is(codeParam, 'YWI+YWI/', 'base64 + and / must stay raw');
  t.false(url.hash.includes('%'), 'hash must not be percent-encoded');
  t.false(codeParam!.includes('='), 'base64 padding should be stripped');
  t.is(decodeTronIde(codeParam!), contractSource, 'Decoded code should equal original source');
});

test('tronIdeURL sets deployProxy flag when upgradeable', t => {
  const contractSource = 'contract A{}';

  const urlTrue = tronIdeURL(contractSource, [], true);
  t.is(getRawHashParams(urlTrue).get('deployProxy'), 'true');

  const urlFalse = tronIdeURL(contractSource, [], false);
  t.is(getRawHashParams(urlFalse).get('deployProxy'), undefined);
});

test('tronIdeURL does not set remaps when remappings is empty', t => {
  const url = tronIdeURL('contract A{}');
  t.is(getRawHashParams(url).get('remaps'), undefined);
});

test('tronIdeURL encodes remappings into remaps hash param', t => {
  const remappings = [
    '@openzeppelin/tron-contracts-upgradeable/=@openzeppelin/tron-contracts-upgradeable@5.6.0/',
    '@openzeppelin/tron-contracts/=@openzeppelin/tron-contracts@5.6.0/',
  ];

  const url = tronIdeURL('contract A{}', remappings, true);
  const remapsParam = getRawHashParams(url).get('remaps');
  t.truthy(remapsParam, 'Expected remaps hash param to be set');

  t.is(decodeTronIde(remapsParam!), remappings.join('\n'), 'Decoded remaps should equal newline-joined remappings');
});

test('containsNonAscii detects the sources TRON IDE would corrupt', t => {
  t.false(containsNonAscii('// SPDX-License-Identifier: MIT\ncontract A{}'));
  t.true(containsNonAscii('__TRC20_init(unicode"héllo", "MTK");'));
  t.true(containsNonAscii('__TRC20_init(unicode"日本語", "MTK");'));
  t.true(containsNonAscii('EIP712(unicode"MyAccount🌾", "1")'));
});

test('TRON IDE decode corrupts non-ASCII sources (why containsNonAscii gates the action)', t => {
  const contractSource = 'string public name = unicode"héllo";';
  t.true(containsNonAscii(contractSource));

  const codeParam = getRawHashParams(tronIdeURL(contractSource)).get('code');
  // Plain atob reads the UTF-8 bytes as Latin-1: "é" arrives as "Ã©".
  t.not(decodeTronIde(codeParam!), contractSource);
  t.true(decodeTronIde(codeParam!).includes('Ã©'));
});
