import test from 'ava';

import { toIdentifier } from './convert-strings';
import { OptionsError } from '../error';

test('identifier - unmodified', t => {
  t.is(toIdentifier('abc'), 'abc');
});

test('identifier - remove leading specials', t => {
  t.is(toIdentifier('--abc'), 'abc');
});

test('identifier - remove specials and upcase next char', t => {
  t.is(toIdentifier('abc-def'), 'abcDef');
  t.is(toIdentifier('abc--def'), 'abcDef');
});

test('identifier - capitalize', t => {
  t.is(toIdentifier('abc', true), 'Abc');
});

test('identifier - remove accents', t => {
  t.is(toIdentifier('ábc'), 'abc');
});

test('identifier - underscores', t => {
  t.is(toIdentifier('_abc_'), '_abc_');
});

test('identifier - remove starting numbers', t => {
  t.is(toIdentifier('123abc456'), 'abc456');
});

test('identifier - empty string', t => {
  const error = t.throws(() => toIdentifier(''), { instanceOf: OptionsError });
  t.is(error.messages.name, 'Identifier is empty or does not have valid characters');
});

test('identifier - no valid chars', t => {
  const error = t.throws(() => toIdentifier('123'), { instanceOf: OptionsError });
  t.is(error.messages.name, 'Identifier is empty or does not have valid characters');
});
