import test from 'ava';

import type { ContractFunction, StoredContractTrait } from './contract';
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
  const trait: StoredContractTrait = {
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
      },
    ],
    name: 'IParent',
  };
  Foo.addImplementedTrait(trait);
  t.snapshot(printContract(Foo));
});

test('contract with parent and associated error', t => {
  const Foo = new ContractBuilder('Foo');
  const trait: StoredContractTrait = {
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
    name: 'IParent',
    associatedError: true,
    errors: [{ variant: 'SomeError', value: { module: 'mod_ext', error: 'Associated' } }],
  };
  Foo.addImplementedTrait(trait);
  t.snapshot(printContract(Foo));
});

test('contract with parent and with function', t => {
  const Foo = new ContractBuilder('Foo');
  const trait: StoredContractTrait = {
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
      },
    ],
    name: 'IParent',
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
  const trait: StoredContractTrait = {
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
      },
    ],
    name: 'IParent',
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
  Foo.addUseClause({ containerPath: 'some::library', name: 'SomeLibrary' });
  t.snapshot(printContract(Foo));
});

test('contract with grouped imports', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addUseClause({ containerPath: 'some::library', name: 'SomeLibrary' });
  Foo.addUseClause({ containerPath: 'some::library', name: 'Misc' });
  t.snapshot(printContract(Foo));
});

test('contract with sorted use clauses', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addUseClause({ containerPath: 'some::library', name: 'SomeLibrary' });
  Foo.addUseClause({ containerPath: 'another::library', name: 'AnotherLibrary' });
  Foo.addUseClause({ containerPath: 'another::library', name: 'Foo', alias: 'Custom2' });
  Foo.addUseClause({ containerPath: 'another::library', name: 'Foo', alias: 'Custom1' });
  t.snapshot(printContract(Foo));
});

test('contract with sorted traits', t => {
  const Foo = new ContractBuilder('Foo');
  const traitA: StoredContractTrait = {
    storage: { name: 'a', type: 'A' },
    modulePath: 'mod_a',
    name: 'IA',
    functions: [{ name: 'func_a', args: [], code: 'todo!()' }],
  };
  const traitB: StoredContractTrait = {
    storage: { name: 'b', type: 'B' },
    modulePath: 'mod_b',
    name: 'IB',
    functions: [{ name: 'func_b', args: [], code: 'todo!()' }],
  };
  const traitSpecial: StoredContractTrait = {
    storage: { name: 'special', type: 'Special' },
    modulePath: 'mod_special',
    name: 'ISpecial',
    functions: [{ name: 'func_special', args: [], code: 'todo!()' }],
  };
  const traitZ: StoredContractTrait = {
    storage: { name: 'z', type: 'Z' },
    modulePath: 'mod_z',
    name: 'IZ',
    functions: [{ name: 'func_z', args: [], code: 'todo!()' }],
  };
  Foo.addFunction(traitZ.functions[0]!, traitZ);
  Foo.addFunction(traitA.functions[0]!, traitA);
  Foo.addFunction(traitSpecial.functions[0]!, traitSpecial);
  Foo.addFunction(traitB.functions[0]!, traitB);
  t.snapshot(printContract(Foo));
});

test('contract with documentation', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addDocumentation('Some documentation');
  t.snapshot(printContract(Foo));
});

test('contract with security info', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addSecurityTag('security@example.com');
  t.snapshot(printContract(Foo));
});

test('contract with security info and documentation', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addSecurityTag('security@example.com');
  Foo.addDocumentation('Some documentation');
  t.snapshot(printContract(Foo));
});
