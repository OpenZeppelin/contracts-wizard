import test from 'ava';

import { toIdentifier, toPrintableShortString } from './convert-strings';

test('toIdentifier - unmodified', t => {
  t.is(toIdentifier('abc'), 'abc');
});

test('toIdentifier - remove leading specials', t => {
  t.is(toIdentifier('--abc'), 'abc');
});

test('toIdentifier - remove specials and upcase next char', t => {
  t.is(toIdentifier('abc-def'), 'abcDef');
  t.is(toIdentifier('abc--def'), 'abcDef');
});

test('toIdentifier - capitalize', t => {
  t.is(toIdentifier('abc', true), 'Abc');
});

test('toIdentifier - remove accents', t => {
  t.is(toIdentifier('ábc'), 'abc');
});

test('toIdentifier - underscores', t => {
  t.is(toIdentifier('_abc_'), '_abc_');
});

test('toIdentifier - remove starting numbers', t => {
  t.is(toIdentifier('123abc456'), 'abc456');
});

test('toPrintableShortString - unmodified', t => {
  t.is(toPrintableShortString('abc'), 'abc');
});

test('toPrintableShortString - remove accents', t => {
  t.is(toPrintableShortString('ábc'), 'abc');
});

test('toPrintableShortString - remove non-ascii-printable characters', t => {
  t.is(toPrintableShortString('abc😀'), 'abc');
});

test('toPrintableShortString - escape single quote', t => {
  t.is(toPrintableShortString("abc'def"), "abc\\'def");
});

test('toPrintableShortString - escape backslash', t => {
  t.is(toPrintableShortString('abc\\def'), 'abc\\\\def');
});

test('toPrintableShortString - limit to 31 characters', t => {
  t.is(toPrintableShortString('A123456789B123456789C123456789D123456789'), 'A123456789B123456789C123456789D');
});