import test from 'ava';
import { computeNamespacedStorageSlot } from './namespaced-slot';

test('namespaced storage slot computation', t => {
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
    {
      input: 'example.main',
      expected: '0x183a6125c38840424c4a85fa12bab2ab606c4b6d0e7cc73c0c06ba5300eab500',
    },
    {
      input: 'MyToken',
      expected: '0xe50b25623ebee85cbe908e55dc189e9b1da401843a56196aa3162de9203a5100',
    },
  ];

  for (const { input, expected } of cases) {
    t.is(computeNamespacedStorageSlot(input), expected);
  }
});
