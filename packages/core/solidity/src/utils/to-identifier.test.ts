import test from 'ava';

import { toIdentifier } from './to-identifier';

test('unmodified', t => {
  t.is(toIdentifier('abc'), 'abc');
});

test('remove leading specials', t => {
  t.is(toIdentifier('--abc'), 'abc');
});

test('remove specials and upcase next char', t => {
  t.is(toIdentifier('abc-def'), 'abcDef');
  t.is(toIdentifier('abc--def'), 'abcDef');
});

test('capitalize', t => {
  t.is(toIdentifier('abc', true), 'Abc');
});
