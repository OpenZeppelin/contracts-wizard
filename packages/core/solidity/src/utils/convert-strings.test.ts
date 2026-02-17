import test from 'ava';

import { toUint256, toBigInt, validateUint256, UINT256_MAX } from './convert-strings';
import { OptionsError } from '../error';

test('toBigInt', t => {
  t.is(toBigInt('123', 'foo'), BigInt(123));
});

test('toBigInt - not number', t => {
  const error = t.throws(() => toBigInt('abc', 'foo'), { instanceOf: OptionsError });
  t.is(error.messages.foo, 'Not a valid number');
});

test('toBigInt - negative', t => {
  const error = t.throws(() => toBigInt('-1', 'foo'), { instanceOf: OptionsError });
  t.is(error.messages.foo, 'Not a valid number');
});

test('validateUint256', t => {
  t.is(validateUint256(BigInt(123), 'foo'), BigInt(123));
});

test('validateUint256 - too large', t => {
  const error = t.throws(() => validateUint256(UINT256_MAX + BigInt(1), 'foo'), { instanceOf: OptionsError });
  t.is(error.messages.foo, 'Value is greater than uint256 max value');
});

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
