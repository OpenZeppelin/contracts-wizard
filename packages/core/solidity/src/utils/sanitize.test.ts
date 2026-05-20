import test from 'ava';
import { stringifyUnicodeSafe } from './sanitize';

test('stringifyUnicodeSafe', t => {
  const cases = [
    {
      input: 'My Token',
      expected: '"My Token"',
      description: 'should handle string with no special characters',
    },
    {
      input: 'MyToke"ć"',
      expected: 'unicode"MyToke\\"ć\\""',
      description: 'should escape double quotes and wrap in unicode"" if unicode characters are present',
    },
    {
      input: '',
      expected: '""',
      description: 'should handle empty string',
    },
    {
      input: 'ć',
      expected: 'unicode"ć"',
      description: 'should handle string with only unicode characters',
    },
    {
      input: 'MyToken',
      expected: '"MyToken"',
      description: 'should handle string with no special characters',
    },
    {
      input: 'MyTok"e"n',
      expected: '"MyTok\\"e\\"n"',
      description: 'should handle escaped double quotes',
    },
    {
      input: 'MyTokeć',
      expected: 'unicode"MyTokeć"',
      description: 'should handle string with mixed ASCII and unicode characters',
    },
    {
      input: 'Path\\file',
      expected: '"Path\\\\file"',
      description: 'should escape backslash in ASCII branch',
    },
    {
      input: 'é\\");',
      expected: 'unicode"é\\\\\\");"',
      description: 'should escape backslash and quote together in unicode branch (no breakout)',
    },
    {
      input: '😀',
      expected: 'unicode"😀"',
      description: 'should pass non-BMP characters through raw (no surrogate escapes)',
    },
    {
      input: '\x7F',
      expected: 'unicode"\x7F"',
      description: 'should pass DEL through raw (allowed by unicode literal grammar)',
    },
    {
      input: '\x00',
      expected: 'unicode"\x00"',
      description: 'should pass NUL through raw (allowed by unicode literal grammar)',
    },
    {
      input: '\x08',
      expected: 'unicode"\x08"',
      description: 'should pass backspace through raw (no Solidity \\b escape exists)',
    },
    {
      input: 'a\nb',
      expected: 'unicode"a\\nb"',
      description: 'should escape LF (excluded from raw unicode literal body)',
    },
    {
      input: 'a\rb',
      expected: 'unicode"a\\rb"',
      description: 'should escape CR (excluded from raw unicode literal body)',
    },
    {
      input: 'a\x0bb',
      expected: 'unicode"a\\x0bb"',
      description: 'should escape vertical tab (Solidity lexer treats it as a line terminator)',
    },
  ];

  for (const { input, expected, description } of cases) {
    t.is(stringifyUnicodeSafe(input), expected, description);
  }
});
