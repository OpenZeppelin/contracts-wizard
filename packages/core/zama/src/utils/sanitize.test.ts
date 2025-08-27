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
  ];

  for (const { input, expected, description } of cases) {
    t.is(stringifyUnicodeSafe(input), expected, description);
  }
});
