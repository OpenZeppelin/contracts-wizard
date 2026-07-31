import test from 'ava';
import { cloneOpts, nextInitialOpts, optsEqual, shouldRefreshInitial } from './opts-snapshot';

test('optsEqual is deep via JSON', t => {
  t.true(optsEqual({ a: 1, b: { c: true } }, { a: 1, b: { c: true } }));
  t.false(optsEqual({ a: 1 }, { a: 2 }));
});

test('cloneOpts returns a deep copy', t => {
  const src = { access: false as const, mintable: true, nested: { x: 1 } };
  const copy = cloneOpts(src);
  t.not(copy, src);
  t.not(copy.nested, src.nested);
  t.deepEqual(copy, src);
});

test('shouldRefreshInitial is true when there is no baseline yet', t => {
  t.true(shouldRefreshInitial(undefined, undefined, 'input'));
  t.true(shouldRefreshInitial(undefined, { mintable: true }, 'result'));
});

test('shouldRefreshInitial allows toolresult refresh while still at baseline', t => {
  const baseline = { mintable: true, access: 'ownable' };
  t.true(shouldRefreshInitial(baseline, baseline, 'result'));
  t.true(shouldRefreshInitial(baseline, cloneOpts(baseline), 'result'));
});

test('shouldRefreshInitial blocks refresh after user drift', t => {
  const baseline = { mintable: true, access: 'ownable' };
  const drifted = { mintable: true, access: 'roles' };
  t.false(shouldRefreshInitial(baseline, drifted, 'result'));
  t.false(shouldRefreshInitial(baseline, drifted, 'input'));
});

test('nextInitialOpts snapshots settled coerced opts, not raw agent access:false', t => {
  const rawFromAgent = { kind: 'ERC20', mintable: true, access: false };
  const afterControls = { kind: 'ERC20', mintable: true, access: 'ownable' };

  const initial = nextInitialOpts(undefined, undefined, afterControls, 'input');
  t.deepEqual(initial, afterControls);
  t.false(optsEqual(initial, rawFromAgent));
});

test('nextInitialOpts keeps baseline when user has drifted before toolresult', t => {
  const baseline = { mintable: true, access: 'ownable' };
  const drifted = { mintable: true, access: 'roles' };
  const fromResult = { mintable: true, pausable: true, access: 'ownable' };

  t.deepEqual(nextInitialOpts(baseline, drifted, fromResult, 'result'), baseline);
});

test('nextInitialOpts refreshes from toolresult while still at baseline', t => {
  const baseline = { mintable: true, access: 'ownable' };
  const fromResult = { mintable: true, pausable: true, access: 'ownable' };

  t.deepEqual(nextInitialOpts(baseline, baseline, fromResult, 'result'), fromResult);
});
