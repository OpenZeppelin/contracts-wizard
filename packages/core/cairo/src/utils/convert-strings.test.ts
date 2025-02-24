import test from 'ava';

import { toIdentifier, toByteArray, toFelt252 } from './convert-strings';
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
  const error = t.throws(() => toIdentifier('123'), {
    instanceOf: OptionsError,
  });
  t.is(error.messages.name, 'Identifier is empty or does not have valid characters');
});

test('toByteArray - unmodified', t => {
  t.is(toByteArray('abc'), 'abc');
});

test('toByteArray - remove accents', t => {
  t.is(toByteArray('ábc'), 'abc');
});

test('toByteArray - remove non-ascii-printable characters', t => {
  t.is(toByteArray('abc😀'), 'abc');
});

test('toByteArray - escape double quote', t => {
  t.is(toByteArray('abc"def'), 'abc\\"def');
});

test('toByteArray - does not escape single quote', t => {
  t.is(toByteArray("abc'def"), "abc'def");
});

test('toByteArray - escape backslash', t => {
  t.is(toByteArray('abc\\def'), 'abc\\\\def');
});

test('more than 31 characters', t => {
  t.is(toByteArray('A234567890123456789012345678901'), 'A234567890123456789012345678901');
  t.is(toByteArray('A2345678901234567890123456789012'), 'A2345678901234567890123456789012');
});

test('toFelt252 - unmodified', t => {
  t.is(toFelt252('abc', 'foo'), 'abc');
});

test('toFelt252 - remove accents', t => {
  t.is(toFelt252('ábc', 'foo'), 'abc');
});

test('toFelt252 - remove non-ascii-printable characters', t => {
  t.is(toFelt252('abc😀', 'foo'), 'abc');
});

test('toFelt252 - escape single quote', t => {
  t.is(toFelt252("abc'def", 'foo'), "abc\\'def");
});

test('toFelt252 - escape backslash', t => {
  t.is(toFelt252('abc\\def', 'foo'), 'abc\\\\def');
});

test('toFelt252 - max 31 characters', t => {
  t.is(toFelt252('A234567890123456789012345678901', 'foo'), 'A234567890123456789012345678901');

  const error = t.throws(() => toFelt252('A2345678901234567890123456789012', 'foo'), { instanceOf: OptionsError });
  t.is(error.messages.foo, 'String is longer than 31 characters');
});
