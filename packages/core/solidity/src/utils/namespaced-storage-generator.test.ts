import test from 'ava';
import { generateNamespacesStorageSlot } from './namespaced-storage-generator';

test('namespaced storage slot generation', t => {
  const cases = [
    {
      input: 'myProject.MyToken',
      expected: '0xfbb7c9e4123fcf4b1aad53c70358f7b1c1d7cf28092f5178b53e55db565e9200',
    },
    {
      input: 'myProject.token',
      expected: '0x86796099e489af07082cc4e6965fe431aadf035a7b4d4b46f81d8dfb81822d00',
    },
    {
      input: 'myProject.token123456',
      expected: '0x824a9aeab482b3e91ee3e454c74509cca55ad57e0185a36d070359384be52800',
    },
  ];

  for (const { input, expected } of cases) {
    t.is(generateNamespacesStorageSlot(input), expected);
  }
});
