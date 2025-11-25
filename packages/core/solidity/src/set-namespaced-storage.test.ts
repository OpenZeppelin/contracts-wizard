import test from 'ava';

import { ContractBuilder } from './contract';
import { printContract } from './print';
import { setNamespacedStorage, toStorageStructInstantiation } from './set-namespaced-storage';
import { OptionsError } from './error';

test('AI - toStorageStructInstantiation returns correct instantiation', t => {
  t.is(toStorageStructInstantiation('Foo'), 'FooStorage storage $ = _getFooStorage();');
});

test('AI - setNamespacedStorage with empty prefix snapshots contract', t => {
  const Foo = new ContractBuilder('Foo');
  setNamespacedStorage(Foo, ['uint256 owner;', 'uint256 value;'], '');
  t.snapshot(printContract(Foo));
});

test('AI - setNamespacedStorage with non-empty prefix snapshots contract', t => {
  const Token = new ContractBuilder('Token');
  setNamespacedStorage(Token, ['uint256 value;'], 'myProject');
  t.snapshot(printContract(Token));
});

test('AI - setNamespacedStorage allows periods in namespace prefix', t => {
  const Token = new ContractBuilder('Token');
  t.notThrows(() => setNamespacedStorage(Token, ['uint256 value;'], 'my.project'));
  t.snapshot(printContract(Token));
});

test('AI - setNamespacedStorage throws with informative message on whitespace', t => {
  const Foo = new ContractBuilder('Foo');
  const cases = ['my Project', 'my\tProject', 'my\nProject', 'my  Project', 'my Project '];
  for (const bad of cases) {
    const err = t.throws(() => setNamespacedStorage(Foo, ['uint256 x;'], bad)) as OptionsError;
    t.true(err instanceof OptionsError);
    t.is(err.message, 'Invalid options');
    t.is(err.messages.namespacePrefix, 'Namespace prefix should not contain whitespace characters');
  }
});
