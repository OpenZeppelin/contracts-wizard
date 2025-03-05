import test from 'ava';

import { escapeString, toIdentifier } from './convert-strings';
import { OptionsError } from '../error';

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

test('toIdentifier - empty string', t => {
  const error = t.throws(() => toIdentifier(''), { instanceOf: OptionsError });
  t.is(error.messages.name, 'Identifier is empty or does not have valid characters');
});

test('toIdentifier - no valid chars', t => {
  const error = t.throws(() => toIdentifier('123'), { instanceOf: OptionsError });
  t.is(error.messages.name, 'Identifier is empty or does not have valid characters');
});

test('escapeString - escapes backslashes', t => {
  t.is(escapeString('abc\\def'), 'abc\\\\def');
  t.is(escapeString('\\'), '\\\\');
  t.is(escapeString('\\\\'), '\\\\\\\\');
});

test('escapeString - escapes double quotes', t => {
  t.is(escapeString('abc"def'), 'abc\\"def');
  t.is(escapeString('"'), '\\"');
  t.is(escapeString('""'), '\\"\\"');
});

test('escapeString - escapes both backslashes and quotes together', t => {
  t.is(escapeString('a\\"b'), 'a\\\\\\"b');
  t.is(escapeString('"\\'), '\\"\\\\'); 
  t.is(escapeString('\\"\\'), '\\\\\\"\\\\');
});

test('escapeString - handles empty string', t => {
  t.is(escapeString(''), '');
});

test('escapeString - leaves other characters unchanged', t => {
  t.is(escapeString('abcdef'), 'abcdef');
  t.is(escapeString('123456'), '123456');
  t.is(escapeString('!@#$%^&*()'), '!@#$%^&*()');
  t.is(escapeString('\n\t\r'), '\n\t\r');  // Note: These aren't escaped in your implementation
});

test('escapeString - handles unicode characters and normalization', t => {
  // Testing NFD normalization (decomposed form)
  const withAccent = 'café';  // 'é' as a single character
  const decomposed = escapeString(withAccent);
  t.is(decomposed.length > withAccent.length, true); // Verify normalization happened
  
  // Test a string with already decomposed characters
  const alreadyDecomposed = 'cafe\u0301'; // 'e' followed by combining acute accent
  t.is(escapeString(alreadyDecomposed), alreadyDecomposed); // Should remain unchanged except for any escaping
  
  // Test other unicode characters
  t.is(escapeString('你好'), '你好'); // Chinese characters
  t.is(escapeString('こんにちは'), 'こんにちは'); // Japanese characters
  t.is(escapeString('안녕하세요'), '안녕하세요'.normalize('NFD')); // Korean characters
  
  // Test emoji (these might be decomposed by NFD)
  const emoji = '😀';
  const escapedEmoji = escapeString(emoji);
  t.not(escapedEmoji, ''); // Should not be empty
});

test('escapeString - handles complex strings with multiple escape sequences', t => {
  const complex = 'This is a "complex" string with \\ multiple \\ "quotes" and backslashes';
  const expected = 'This is a \\"complex\\" string with \\\\ multiple \\\\ \\"quotes\\" and backslashes';
  t.is(escapeString(complex), expected);
});

test('escapeString - handles strings with JSON-like content', t => {
  const jsonLike = '{"key": "value", "path": "C:\\\\folder\\"}';
  const expected = '{\\\"key\\\": \\\"value\\\", \\\"path\\\": \\\"C:\\\\\\\\folder\\\\\\\"}';
  t.is(escapeString(jsonLike), expected);
});

test('escapeString - handles consecutive escape characters correctly', t => {
  t.is(escapeString('\\\\\\'), '\\\\\\\\\\\\');
  t.is(escapeString('"""'), '\\"\\"\\"');
  t.is(escapeString('\\"\\"\\"'), '\\\\\\"\\\\\\"\\\\\\"');
});