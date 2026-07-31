import test from 'ava';
import { buildGeneric, printContract } from '@openzeppelin/wizard';
import { cloneOpts, isDrifted, nextBaseline, shouldCaptureBaseline } from './opts-snapshot';

type StubOpts = Record<string, unknown>;
/** Stands in for `adapter.print(adapter.build(opts))`; `bad` options fail to build. */
const stubPrint = (opts: StubOpts) => (opts.bad ? undefined : JSON.stringify(opts));

test('cloneOpts returns a deep copy', t => {
  const src = { access: false as const, mintable: true, nested: { x: 1 } };
  const copy = cloneOpts(src);
  t.not(copy, src);
  t.not(copy.nested, src.nested);
  t.deepEqual(copy, src);
});

test('isDrifted stays quiet until there is a baseline to compare against', t => {
  t.false(isDrifted({ originalCode: undefined, code: 'contract Foo {}', hasErrors: false }));
  t.false(isDrifted({ originalCode: undefined, code: '', hasErrors: true }));
});

test('isDrifted reports a changed preview', t => {
  t.false(isDrifted({ originalCode: 'contract Foo {}', code: 'contract Foo {}', hasErrors: false }));
  t.true(isDrifted({ originalCode: 'contract Foo {}', code: 'contract Bar {}', hasErrors: false }));
});

// The preview freezes at its last good value while a build fails, so it can equal the baseline
// even though the form no longer does. Without this the banner and its Restore link would vanish
// exactly when the user needs them.
test('isDrifted reports an invalid form even when the stale preview matches', t => {
  t.true(isDrifted({ originalCode: 'contract Foo {}', code: 'contract Foo {}', hasErrors: true }));
});

test('shouldCaptureBaseline captures on the first host apply', t => {
  t.true(shouldCaptureBaseline(undefined, false, 'input'));
  t.true(shouldCaptureBaseline(undefined, true, 'result'), 'nothing to protect without a baseline');
});

test('shouldCaptureBaseline recaptures from a toolresult while the preview has not drifted', t => {
  t.true(shouldCaptureBaseline('contract Foo {}', false, 'result'));
});

test('shouldCaptureBaseline keeps the baseline once the preview has drifted', t => {
  t.false(shouldCaptureBaseline('contract Foo {}', true, 'result'));
});

test('shouldCaptureBaseline never recaptures from a toolinput', t => {
  t.false(shouldCaptureBaseline('contract Foo {}', false, 'input'));
  t.false(shouldCaptureBaseline('contract Foo {}', true, 'input'));
});

test('nextBaseline prefers the merged options when they build', t => {
  const merged: StubOpts = { mintable: true, pausable: true };
  const baseline = nextBaseline(merged, { pausable: true }, stubPrint);

  t.deepEqual(baseline?.opts, merged);
  t.is(baseline?.code, stubPrint(merged));
  t.false(baseline?.supersedesOpts);
  t.not(baseline?.opts, merged, 'baseline must not alias options the Controls mutate');
});

// Host applies accumulate, so one unbuildable apply would otherwise poison every later merge
// and leave drift undetectable for the rest of the session.
test('nextBaseline falls back to the incoming options when the merge does not build', t => {
  const baseline = nextBaseline<StubOpts>({ bad: true, mintable: true }, { mintable: true }, stubPrint);

  t.deepEqual(baseline?.opts, { mintable: true });
  t.true(baseline?.supersedesOpts, 'the buildable apply supersedes the stale arguments');
});

test('nextBaseline defers when neither the merge nor the incoming options build', t => {
  t.is(nextBaseline<StubOpts>({ bad: true }, { bad: true }, stubPrint), undefined);
});

// Why drift is measured over generated source instead of options objects: Controls coerce required
// fields (access: false → ownable when mintable), and that coercion must not read as a user edit.
// Printing both option sets through one generator makes it invisible. This is the invariant the
// whole approach rests on — a coercion the generator does not imply is a bug in that pair, not a
// case for this logic to absorb.
test('implied access control prints identically to the coerced option', t => {
  const requested = { kind: 'ERC20', name: 'MyToken', symbol: 'MTK', mintable: true, access: false } as const;
  const coerced = { ...requested, access: 'ownable' } as const;

  t.is(printContract(buildGeneric(requested)), printContract(buildGeneric(coerced)));
  t.notDeepEqual({ ...requested }, { ...coerced });
});
