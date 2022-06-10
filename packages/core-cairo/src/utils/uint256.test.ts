import test from 'ava';
import BN from 'bn.js';

import { NumberTooLarge, toUint256 } from './uint256';

test('basic', t => {
  t.deepEqual(toUint256('1000'), { lowBits: new BN(1000), highBits: new BN(0) });
  t.deepEqual(toUint256('0'), { lowBits: new BN(0), highBits: new BN(0) });
  t.deepEqual(toUint256(''), { lowBits: new BN(0), highBits: new BN(0) });
});

test('max values', t => {
  const twoE128minus1 = toUint256('340282366920938463463374607431768211455'); // 2^128-1
  t.is(twoE128minus1.highBits.toString(), '0');
  t.is(twoE128minus1.lowBits.toString(), '340282366920938463463374607431768211455');

  const twoE128 = toUint256('340282366920938463463374607431768211456'); // 2^128
  t.is(twoE128.highBits.toString(), '1');
  t.is(twoE128.lowBits.toString(), '0');

  const twoE128plus1 = toUint256('340282366920938463463374607431768211457'); // 2^128+1
  t.is(twoE128plus1.highBits.toString(), '1');
  t.is(twoE128plus1.lowBits.toString(), '1');

  const maxValue = toUint256('115792089237316195423570985008687907853269984665640564039457584007913129639935'); // 2^256-1
  t.is(maxValue.highBits.toString(), '340282366920938463463374607431768211455'); // 2^128-1
  t.is(maxValue.lowBits.toString(), '340282366920938463463374607431768211455'); // 2^128-1
  
  const error = t.throws(() => toUint256('115792089237316195423570985008687907853269984665640564039457584007913129639936')); // 2^256
  t.assert(error instanceof NumberTooLarge);
});

