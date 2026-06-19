import test from 'ava';

import { toUint, toBigInt, UINT256_MAX } from './convert-strings';
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

test('toUint - uint256', t => {
  t.is(toUint('123', 'foo', 'uint256'), BigInt(123));
});

test('toUint - uint256 max', t => {
  t.is(toUint(String(UINT256_MAX), 'foo', 'uint256'), UINT256_MAX);
});

test('toUint - not number', t => {
  const error = t.throws(() => toUint('abc', 'foo', 'uint256'), { instanceOf: OptionsError });
  t.is(error.messages.foo, 'Not a valid number');
});

test('toUint - negative', t => {
  const error = t.throws(() => toUint('-1', 'foo', 'uint256'), { instanceOf: OptionsError });
  t.is(error.messages.foo, 'Not a valid number');
});

test('toUint - uint256 too large', t => {
  const error = t.throws(() => toUint(String(UINT256_MAX + BigInt(1)), 'foo', 'uint256'), {
    instanceOf: OptionsError,
  });
  t.is(error.messages.foo, 'Value is greater than uint256 max value');
});

test('toUint - uint8', t => {
  t.is(toUint('255', 'foo', 'uint8'), BigInt(255));
});

test('toUint - uint8 too large', t => {
  const error = t.throws(() => toUint('256', 'foo', 'uint8'), { instanceOf: OptionsError });
  t.is(error.messages.foo, 'Value is greater than uint8 max value');
});
