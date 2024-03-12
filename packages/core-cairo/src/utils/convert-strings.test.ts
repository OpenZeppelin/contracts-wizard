import test from 'ava';

import { toIdentifier, toStringLiteral } from './convert-strings';
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

test('toStringLiteral - unmodified', t => {
  t.is(toStringLiteral('abc'), 'abc');
});

test('toStringLiteral - remove accents', t => {
  t.is(toStringLiteral('ábc'), 'abc');
});

test('toStringLiteral - remove non-ascii-printable characters', t => {
  t.is(toStringLiteral('abc😀'), 'abc');
});

test('toStringLiteral - escape double quote', t => {
  t.is(toStringLiteral("abc\"def"), "abc\\\"def");
});

test('toStringLiteral - does not escape single quote', t => {
  t.is(toStringLiteral("abc'def"), "abc'def");
});

test('toStringLiteral - escape backslash', t => {
  t.is(toStringLiteral('abc\\def'), 'abc\\\\def');
});

test('more than 31 characters', t => {
  t.is(toStringLiteral('A234567890123456789012345678901'), 'A234567890123456789012345678901');
  t.is(toStringLiteral('A2345678901234567890123456789012'), 'A2345678901234567890123456789012');
});