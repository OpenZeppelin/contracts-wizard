import test from 'ava';

import type { ContractFunction, ImplementedTrait } from './contract';
import { ContractBuilder } from './contract';
import { printContract } from './print';
import { getSelfArg } from './common-options';

test('contract basics', t => {
  const Foo = new ContractBuilder('Foo');
  t.snapshot(printContract(Foo));
});

test('contract with function', t => {
  const Foo = new ContractBuilder('Foo');
  const fn: ContractFunction = {
    name: 'some_function',
    args: [getSelfArg('immutable')],
    code: 'todo!()',
  };
  Foo.addFunction(fn);
  t.snapshot(printContract(Foo));
});

test('contract with function and code before', t => {
  const Foo = new ContractBuilder('Foo');
  const fn: ContractFunction = {
    name: 'some_function',
    args: [getSelfArg('immutable')],
    code: 'todo!()',
  };
  Foo.addFunction(fn);
  Foo.addFunctionCodeBefore(fn, ['before();']);
  t.snapshot(printContract(Foo));
});

test('contract with parent', t => {
  const Foo = new ContractBuilder('Foo');
  const trait: ImplementedTrait = {
    storage: {
      name: 'parent',
      type: 'Parent',
    },
    modulePath: 'mod_ext',
    functions: [
      {
        name: 'some_function',
        args: [getSelfArg('immutable')],
        code: 'self.parent.some_function()',
      }
    ],
    interface: 'IParent',
  };
  Foo.addImplementedTrait(trait);
  t.snapshot(printContract(Foo));
});

test('contract with parent and associated error', t => {
  const Foo = new ContractBuilder('Foo');
  const trait: ImplementedTrait = {
    storage: {
      name: 'parent',
      type: 'Parent',
    },
    modulePath: 'mod_ext',
    functions: [
      {
        name: 'some_function',
        args: [getSelfArg('immutable')],
        code: 'self.parent.some_function()?',
        returns: { ok: '()', err: 'Self::Error' },
      },
    ],
    interface: 'IParent',
    hasError: true,
  };
  Foo.addImplementedTrait(trait);
  t.snapshot(printContract(Foo));
});

test('contract with parent and with function', t => {
  const Foo = new ContractBuilder('Foo');
  const trait: ImplementedTrait = {
    storage: {
      name: 'parent',
      type: 'Parent',
    },
    modulePath: 'mod_ext',
    functions: [
      {
        name: 'some_function',
        args: [getSelfArg('immutable')],
        code: 'self.parent.some_function()',
      }
    ],
    interface: 'IParent',
  };
  Foo.addImplementedTrait(trait);
  
  const fn: ContractFunction = {
    name: 'my_function',
    args: [getSelfArg('immutable')],
    code: 'todo!()',
  };
  Foo.addFunction(fn);
  t.snapshot(printContract(Foo));
});

test('contract with parent and with function with code before', t => {
  const Foo = new ContractBuilder('Foo');
  const trait: ImplementedTrait = {
    storage: {
      name: 'parent',
      type: 'Parent',
    },
    modulePath: 'mod_ext',
    functions: [
      {
        name: 'some_function',
        args: [getSelfArg('immutable')],
        code: 'self.parent.some_function()',
      }
    ],
    interface: 'IParent',
  };
  Foo.addImplementedTrait(trait);
  Foo.addFunctionCodeBefore(trait.functions[0]!, ['before();'], trait);
  
  const fn: ContractFunction = {
    name: 'my_function',
    args: [getSelfArg('immutable')],
    code: 'todo!()',
  };
  Foo.addFunction(fn);
  Foo.addFunctionCodeBefore(fn, ['before();']);
  
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
  Foo.addUseClause('another::library', 'Foo', { alias: 'Custom2' });
  Foo.addUseClause('another::library', 'Foo', { alias: 'Custom1' });
  t.snapshot(printContract(Foo));
});

test('contract with sorted traits', t => {
  const Foo = new ContractBuilder('Foo');
  const traitA: ImplementedTrait = { 
    storage: { name: 'a', type: 'A' },
    modulePath: 'mod_a',
    interface: 'IA',
    functions: [{name: 'func_a', args: [], code: 'todo!()'}],
  };
  const traitB: ImplementedTrait = { 
    storage: { name: 'b', type: 'B' },
    modulePath: 'mod_b',
    interface: 'IB',
    functions: [{name: 'func_b', args: [], code: 'todo!()'}],
  };
  const traitSpecial: ImplementedTrait = { 
    storage: { name: 'special', type: 'Special' },
    modulePath: 'mod_special',
    interface: 'ISpecial',
    functions: [{name: 'func_special', args: [], code: 'todo!()'}],
  };
  const traitZ: ImplementedTrait = { 
    storage: { name: 'z', type: 'Z' },
    modulePath: 'mod_z',
    interface: 'IZ',
    functions: [{name: 'func_z', args: [], code: 'todo!()'}],
  };
  Foo.addFunction(traitZ.functions[0]!, traitZ);
  Foo.addFunction(traitA.functions[0]!, traitA);
  Foo.addFunction(traitSpecial.functions[0]!, traitSpecial);
  Foo.addFunction(traitB.functions[0]!, traitB);
  t.snapshot(printContract(Foo));
});
