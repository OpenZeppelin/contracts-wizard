import test from 'ava';

import { ContractBuilder, BaseFunction, BaseImplementedTrait, Component } from './contract';
import { printContract } from './print';

const FOO_COMPONENT: Component = {
  name: 'FooComponent',
  path: 'some::path',
  substorage: {
    name: 'foo',
    type: 'FooComponent::Storage',
  },
  event: {
    name: 'FooEvent',
    type: 'FooComponent::Event',
  },
  impls: [
    {
      name: 'FooImpl',
      value: 'FooComponent::FooImpl<ContractState>',
    },
  ],
  internalImpl: {
    name: 'FooInternalImpl',
    value: 'FooComponent::InternalImpl<ContractState>',
  },
};

test('contract basics', t => {
  const Foo = new ContractBuilder('Foo');
  t.snapshot(printContract(Foo));
});

test('contract with constructor code', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addConstructorCode('someFunction()');
  t.snapshot(printContract(Foo));
});

test('contract with constructor code with semicolon', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addConstructorCode('someFunction();');
  t.snapshot(printContract(Foo));
});

test('contract with function code before', t => {
  const Foo = new ContractBuilder('Foo');
  const trait: BaseImplementedTrait = {
    name: 'External',
    of: 'ExternalTrait',
    tags: [
      'generate_trait',
      'abi(per_item)',
    ],
    perItemTag: 'external(v0)',
  };
  Foo.addImplementedTrait(trait);
  const fn: BaseFunction = {
    name: 'someFunction',
    args: [],
    code: [
      'someFunction()'
    ]
  };
  Foo.addFunction(trait, fn);
  Foo.addFunctionCodeBefore(trait, fn, 'before()');
  t.snapshot(printContract(Foo));
});

test('contract with function code before with semicolons', t => {
  const Foo = new ContractBuilder('Foo');
  const trait: BaseImplementedTrait = {
    name: 'External',
    of: 'ExternalTrait',
    tags: [
      'generate_trait',
      'abi(per_item)',
    ],
    perItemTag: 'external(v0)',
  };
  Foo.addImplementedTrait(trait);
  const fn: BaseFunction = {
    name: 'someFunction',
    args: [],
    code: [
      'someFunction();'
    ]
  };
  Foo.addFunction(trait, fn);
  Foo.addFunctionCodeBefore(trait, fn, 'before();');
  t.snapshot(printContract(Foo));
});

test('contract with initializer params', t => {
  const Foo = new ContractBuilder('Foo');

  Foo.addComponent(
    FOO_COMPONENT,
    ['param1'],
    true
  );
  t.snapshot(printContract(Foo));
});

test('contract with standalone import', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addComponent(
    FOO_COMPONENT,
  );
  Foo.addStandaloneImport('some::library::SomeLibrary');
  t.snapshot(printContract(Foo));
});
