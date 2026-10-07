import test from 'ava';

import {
  escapeString,
  toBaseUnits,
  toBaseUnitsExpression,
  toIdentifier,
  toRustIntegerLiteral,
  toSnakeCase,
  utf8ByteLength,
} from './convert-strings';
import type { OptionsError } from '../error';

test('toIdentifier', t => {
  t.is(toIdentifier('My Token', true), 'MyToken');
  t.is(toIdentifier('my token'), 'myToken');
  t.is(toIdentifier('123 Token', true), 'Token');
  t.is(toIdentifier('Ünïcödé Tökén', true), 'UnicodeToken');
  t.throws(() => toIdentifier('$$$'));
});

test('toSnakeCase', t => {
  t.is(toSnakeCase('MyToken'), 'my_token');
  t.is(toSnakeCase('My Token'), 'my_token');
  t.is(toSnakeCase('MyNFTCollection'), 'my_nft_collection');
  t.is(toSnakeCase('token'), 'token');
});

test('escapeString', t => {
  t.is(escapeString('plain'), 'plain');
  t.is(escapeString('say "hi"'), 'say \\"hi\\"');
  t.is(escapeString('back\\slash'), 'back\\\\slash');
  t.is(escapeString('line\nbreak\r\ttab'), 'line\\nbreak\\r\\ttab');
  t.is(escapeString('a b'), 'a\\u{2028}b');
});

test('escapeString keeps text as typed', t => {
  // Composed and decomposed accents stay as given, so the value has the bytes that were checked against the limits.
  t.is(escapeString('Caf\u00e9'), 'Caf\u00e9');
  t.is(escapeString('Cafe\u0301'), 'Cafe\u0301');
  t.is(escapeString('My Token \u{1fa99} \u4ee3\u5e01'), 'My Token \u{1fa99} \u4ee3\u5e01');
});

test('escapeString escapes characters that would not show in the source', t => {
  t.is(escapeString('a\u202eb\u2066c'), 'a\\u{202e}b\\u{2066}c');
  t.is(escapeString('zero\u200bwidth'), 'zero\\u{200b}width');
  t.is(escapeString('no\u00a0break'), 'no\\u{a0}break');
  t.is(escapeString('\u0000\u001b\u007f'), '\\u{0}\\u{1b}\\u{7f}');
  t.is(escapeString('\u{1f468}\u200d\u{1f469}'), '\u{1f468}\\u{200d}\u{1f469}');
  t.is(escapeString('soft\u00adhyphen\ufeff'), 'soft\\u{ad}hyphen\\u{feff}');
});

test('utf8ByteLength', t => {
  t.is(utf8ByteLength('abc'), 3);
  t.is(utf8ByteLength('é'), 2);
  t.is(utf8ByteLength('🪙'), 4);
});

test('toRustIntegerLiteral', t => {
  t.is(toRustIntegerLiteral(0n), '0');
  t.is(toRustIntegerLiteral(999n), '999');
  t.is(toRustIntegerLiteral(1000n), '1_000');
  t.is(toRustIntegerLiteral(100000000000000000n), '100_000_000_000_000_000');
});

test('toBaseUnitsExpression', t => {
  t.is(toBaseUnitsExpression('1000000000'), '1_000_000_000 * 10u64.pow(Self::DECIMALS as u32)');
  t.is(toBaseUnitsExpression('1000.5'), '10_005 * 10u64.pow(Self::DECIMALS as u32 - 1)');
  t.is(toBaseUnitsExpression('1.50'), '15 * 10u64.pow(Self::DECIMALS as u32 - 1)');
  t.is(toBaseUnitsExpression('.05'), '5 * 10u64.pow(Self::DECIMALS as u32 - 2)');
  t.is(toBaseUnitsExpression(' 10. '), '10 * 10u64.pow(Self::DECIMALS as u32)');
  t.is(toBaseUnitsExpression('1'), '10u64.pow(Self::DECIMALS as u32)');
  t.is(toBaseUnitsExpression('0.00000001'), '10u64.pow(Self::DECIMALS as u32 - 8)');
});

test('toBaseUnitsExpression has the value of toBaseUnits', t => {
  const cases: [string, number][] = [
    ['1000000000', 8],
    ['1000.5', 3],
    ['0.05', 2],
    ['42', 0],
    ['9223372.03470729216', 12],
  ];
  for (const [amount, decimals] of cases) {
    const expression = toBaseUnitsExpression(amount);
    const match = /^(?:([\d_]+) \* )?10u64\.pow\(Self::DECIMALS as u32(?: - (\d+))?\)$/.exec(expression);
    if (match === null) {
      t.fail(`unexpected expression ${expression}`);
      continue;
    }
    const units = BigInt((match[1] ?? '1').replace(/_/g, ''));
    const value = units * 10n ** BigInt(decimals - Number(match[2] ?? 0));
    t.is(value.toString(), toBaseUnits(amount, decimals, 'maxSupply'), amount);
  }
});

test('toBaseUnits', t => {
  t.is(toBaseUnits('1000', 8, 'maxSupply'), '100000000000');
  t.is(toBaseUnits('1.5', 2, 'maxSupply'), '150');
  t.is(toBaseUnits('0.5', 1, 'maxSupply'), '5');
  t.is(toBaseUnits('.5', 1, 'maxSupply'), '5');
  t.is(toBaseUnits('0', 8, 'maxSupply'), '0');
  t.is(toBaseUnits('42', 0, 'maxSupply'), '42');
  t.is(toBaseUnits(' 7 ', 0, 'maxSupply'), '7');
  for (const invalid of ['', '.', '1.2.3', 'abc', '-1', '1e5']) {
    const error = t.throws(() => toBaseUnits(invalid, 8, 'maxSupply')) as OptionsError;
    t.is(error.messages.maxSupply, 'Not a valid number');
  }
  const error = t.throws(() => toBaseUnits('1.123', 2, 'maxSupply')) as OptionsError;
  t.is(error.messages.maxSupply, 'Too many decimals');
});
