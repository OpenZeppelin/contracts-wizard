import test from 'ava';

import { toUint256, UINT256_MAX } from './convert-strings';
import { OptionsError } from '../error';

test('toUint256', t => {
  t.is(toUint256('123', 'foo'), BigInt(123));
});

test('toUint256 - not number', t => {
  const error = t.throws(() => toUint256('abc', 'foo'), { instanceOf: OptionsError });
  t.is(error.messages.foo, 'Not a valid number');
});

test('toUint256 - negative', t => {
  const error = t.throws(() => toUint256('-1', 'foo'), { instanceOf: OptionsError });
  t.is(error.messages.foo, 'Not a valid number');
});

test('toUint256 - too large', t => {
  const error = t.throws(() => toUint256(String(UINT256_MAX + BigInt(1)), 'foo'), { instanceOf: OptionsError });
  t.is(error.messages.foo, 'Value is greater than uint256 max value');
});
