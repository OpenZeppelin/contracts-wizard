import test from 'ava';

import { toIdentifier, toShortString } from './convert-strings';
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
  let error = t.throws(() => toIdentifier(''), { instanceOf: OptionsError });
  t.is(error.messages.name, 'Identifier is empty or does not have valid characters');
});

test('identifier - no valid chars', t => {
  let error = t.throws(() => toIdentifier('123'),  { instanceOf: OptionsError });
  t.is(error.messages.name, 'Identifier is empty or does not have valid characters');
});

test('short string - unmodified', t => {
  t.is(toShortString('abc', 'foo'), 'abc');
});

test('short string - remove accents', t => {
  t.is(toShortString('ábc', 'foo'), 'abc');
});

test('short string - remove non-ascii-printable characters', t => {
  t.is(toShortString('abc😀', 'foo'), 'abc');
});

test('short string - escape single quote', t => {
  t.is(toShortString("abc'def", 'foo'), "abc\\'def");
});

test('short string - escape backslash', t => {
  t.is(toShortString('abc\\def', 'foo'), 'abc\\\\def');
});

test('short string - max 31 characters', t => {
  t.is(toShortString('A234567890123456789012345678901', 'foo'), 'A234567890123456789012345678901');

  let error = t.throws(() => toShortString('A2345678901234567890123456789012', 'foo'), { instanceOf: OptionsError });
  t.is(error.messages.foo, 'String is longer than 31 characters');
});