import test from 'ava';

import { ContractBuilder } from './contract';
import { printContract } from './print';

test('contract basics', t => {
  const Foo = new ContractBuilder('Foo');
  t.snapshot(printContract(Foo));
});

test('contract name conversions', t => {
  const c = new ContractBuilder('my "quoted" token');
  t.is(c.name.identifier, 'MyQuotedToken');
  t.is(c.name.moduleName, 'my_quoted_token');
});

test('contract with constant and function', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addUseClause('miden_protocol::account', 'Account');
  Foo.addUseClause('miden_protocol::account', 'AccountBuilder');
  Foo.addUseClause('std::collections', 'BTreeSet');
  Foo.addUseClause('miden_protocol::account::auth', 'PublicKey');
  Foo.addConstant({ name: 'NAME', type: "&'static str", value: '"Foo"', comments: ['Token name.'] });
  Foo.addFunction({
    name: 'some_function',
    comments: ['Does something.'],
    args: [{ name: 'value', type: 'u64' }],
    returns: 'u64',
    code: ['value'],
    pub: true,
  });
  Foo.addFunction({
    name: 'other_function',
    comments: [],
    args: [],
    code: ['todo!()'],
    pub: false,
  });
  t.snapshot(printContract(Foo));
});

test('contract long use clause and signature are wrapped', t => {
  const Foo = new ContractBuilder('Foo');
  for (const name of [
    'AllowlistConfigNote',
    'BlocklistConfigNote',
    'FaucetMetadataConfigNote',
    'NetworkAccountConfigNote',
    'OwnerConfigNote',
    'PauseConfigNote',
    'RbacConfigNote',
  ]) {
    Foo.addUseClause('miden_standards::note::config', name);
  }
  Foo.addFunction({
    name: 'create',
    comments: [],
    args: [
      { name: 'init_seed', type: '[u8; 32]' },
      { name: 'owner', type: 'AccountId' },
      { name: 'fee_faucet_id', type: 'AccountId' },
    ],
    returns: 'Result<Account, AccountError>',
    code: ['todo!()'],
    pub: true,
  });
  t.snapshot(printContract(Foo));
});

test('duplicate use clauses, constants and functions are ignored', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addUseClause('a::b', 'C');
  Foo.addUseClause('a::b', 'C');
  t.is(Foo.useClauses.length, 1);
  t.true(Foo.addConstant({ name: 'X', type: 'u8', value: '1', comments: [] }));
  t.false(Foo.addConstant({ name: 'X', type: 'u8', value: '2', comments: [] }));
  t.is(Foo.constants[0]?.value, '1');
  const fn = Foo.addFunction({ name: 'f', comments: [], args: [], code: ['1'], pub: true });
  const again = Foo.addFunction({ name: 'f', comments: [], args: [], code: ['2'], pub: true });
  t.is(fn, again);
  t.is(Foo.functions.length, 1);
});

test('security contact is added as a comment', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addSecurityTag('security@example.com');
  Foo.license = 'WTFPL';
  t.snapshot(printContract(Foo));
});
