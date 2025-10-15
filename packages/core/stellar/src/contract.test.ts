import test from 'ava';

import type { BaseFunction, BaseTraitImplBlock } from './contract';
import { ContractBuilder } from './contract';
import { printContract } from './print';
import { setInfo } from './set-info';

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
  const trait: BaseTraitImplBlock = {
    traitName: 'External',
    structName: 'ExternalTrait',
    tags: ['othertag', 'contractimpl'],
  };
  Foo.addTraitImplBlock(trait);
  const fn: BaseFunction = {
    pub: false,
    name: 'someFunction',
    args: [],
    code: ['someFunction()'],
  };
  Foo.addTraitFunction(trait, fn);
  Foo.addFunctionTag(fn, 'functiontag', trait);
  Foo.addFunctionCodeBefore(fn, ['before()'], trait);
  t.snapshot(printContract(Foo));
});

test('contract with function code before with semicolons', t => {
  const Foo = new ContractBuilder('Foo');
  const trait: BaseTraitImplBlock = {
    traitName: 'External',
    structName: 'ExternalTrait',
    tags: ['othertag', 'contractimpl'],
  };
  Foo.addTraitImplBlock(trait);
  const fn: BaseFunction = {
    pub: false,
    name: 'someFunction',
    args: [],
    code: ['someFunction();'],
  };
  Foo.addTraitFunction(trait, fn);
  Foo.addFunctionTag(fn, 'functiontag', trait);
  Foo.addFunctionCodeBefore(fn, ['before();'], trait);
  t.snapshot(printContract(Foo));
});

test('contract with standalone import', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addUseClause('some::library', 'SomeLibrary');
  t.snapshot(printContract(Foo));
});

test('contract with grouped imports', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addUseClause('some::library', 'SomeLibrary');
  Foo.addUseClause('some::library', 'Misc');
  t.snapshot(printContract(Foo));
});

test('contract with sorted use clauses', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addUseClause('some::library', 'SomeLibrary');
  Foo.addUseClause('another::library', 'AnotherLibrary');
  Foo.addUseClause('another::library', 'self', { alias: 'custom2' });
  Foo.addUseClause('another::library', 'self', { alias: 'custom1' });
  t.snapshot(printContract(Foo));
});

test('contract with documentation', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addDocumentation('Some documentation');
  t.snapshot(printContract(Foo));
});

test('contract with security contact metadata', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addContractMetadata({ key: 'contact', value: 'security@example.com' });
  t.snapshot(printContract(Foo));
});

test('setting metadata with same key throws', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addContractMetadata({ key: 'contact', value: 'security@example.com' });

  t.throws(() => Foo.addContractMetadata({ key: 'contact', value: 'security@example.com' }));
});

test('contract with multiple metadata', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addContractMetadata([
    { key: 'contact', value: 'security@example.com' },
    { key: 'meta', value: 'data' },
  ]);
  t.snapshot(printContract(Foo));
});

test('contract with multiple metadata and documentation', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addContractMetadata([
    { key: 'contact', value: 'security@example.com' },
    { key: 'meta', value: 'data' },
  ]);
  Foo.addDocumentation('Some documentation');
  t.snapshot(printContract(Foo));
});

test('contract with setInfo', t => {
  const Foo = new ContractBuilder('Foo');
  setInfo(Foo, { securityContact: 'security@example.com', license: 'MIT' });

  t.snapshot(printContract(Foo));
});
