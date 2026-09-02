import test from 'ava';
import { buildGeneric, printContract } from '@openzeppelin/wizard';
import { cloneOpts, isDrifted, nextBaseline, shouldCaptureBaseline } from './opts-snapshot';

/**
 * End-to-end drift behaviour over the sequence `KindApp.svelte` actually sees: host applies,
 * Controls coercions, user edits, restore.
 *
 * The decisions come from the real helpers; only the wiring is reproduced here, because the
 * component's own state is bound to Svelte and to a Controls component and there is no
 * component-test setup in this package. Keep `apply` in step with `mergeHostOpts`.
 */
function makeApp(kind = 'ERC20') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let opts: any = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let originalOpts: any = undefined;
  let originalCode: string | undefined = undefined;
  let contract: unknown = undefined;
  let hasErrors = false;

  const printOpts = (o: unknown) => {
    try {
      return printContract(buildGeneric(o as never));
    } catch {
      return undefined;
    }
  };

  /** The `$: if (opts)` block: `contract` keeps its last good value when the build throws. */
  const flush = () => {
    try {
      contract = buildGeneric(opts);
      hasErrors = false;
    } catch {
      hasErrors = true;
    }
  };
  const code = () => (contract === undefined ? '' : printContract(contract as never));
  const drifted = () => isDrifted({ originalCode, code: code(), hasErrors });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function apply(incoming: any, source: 'input' | 'result') {
    const captureBaseline = shouldCaptureBaseline(originalCode, drifted(), source);
    const merged = { ...(opts ?? {}), ...incoming, kind };
    opts = merged;
    if (captureBaseline) {
      const baseline = nextBaseline(merged, { ...incoming, kind }, printOpts);
      if (baseline !== undefined) {
        originalOpts = baseline.opts;
        originalCode = baseline.code;
        if (baseline.supersedesOpts) opts = cloneOpts(baseline.opts);
      }
    }
    flush();
    return captureBaseline;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setOpts = (patch: any) => {
    opts = { ...opts, ...patch };
    flush();
  };
  const restore = () => {
    opts = cloneOpts(originalOpts);
    flush();
  };

  return { apply, setOpts, restore, drifted, opts: () => opts, originalOpts: () => originalOpts };
}

/** What an agent sends for a mintable token: access is left off, and the Controls fill it in. */
const REQUESTED = { name: 'MyToken', symbol: 'MTK', mintable: true, access: false } as const;

test('the coercion Controls apply to host options does not drift', t => {
  const app = makeApp();
  app.apply(REQUESTED, 'input');
  app.setOpts({ access: 'ownable' }); // AccessControlSection, because mintable requires an owner

  t.is(app.originalOpts().access, false, 'the baseline keeps the options as requested');
  t.false(app.drifted());
});

test('a user edit drifts, and a late toolresult cannot erase it', t => {
  const app = makeApp();
  app.apply(REQUESTED, 'input');
  app.setOpts({ access: 'ownable' });
  app.setOpts({ pausable: true });
  t.true(app.drifted());

  t.false(app.apply(REQUESTED, 'result'), 'recapture is blocked');
  t.true(app.drifted());
});

// The preview freezes at its last good value while a build fails, so an invalid first edit leaves
// the source equal to the baseline. Neither the banner nor the recapture guard may be fooled.
test('an invalid first edit drifts and survives a toolresult', t => {
  const app = makeApp();
  app.apply(REQUESTED, 'input');
  app.setOpts({ access: 'ownable' });
  app.setOpts({ premint: 'garbage' });

  t.true(app.drifted(), 'the Restore link stays reachable');
  t.false(app.apply(REQUESTED, 'result'));
  t.is(app.opts().premint, 'garbage', 'the edit is preserved');
});

test('restore original clears drift', t => {
  const app = makeApp();
  app.apply(REQUESTED, 'input');
  app.setOpts({ access: 'ownable' });
  app.setOpts({ access: 'roles' });
  t.true(app.drifted());

  app.restore();
  app.setOpts({ access: 'ownable' }); // the Controls coerce again on the way back
  t.false(app.drifted());
});

test('a toolresult refines the baseline while the preview has not drifted', t => {
  const app = makeApp();
  app.apply({ name: 'MyToken', symbol: 'MTK' }, 'input');

  t.true(app.apply({ ...REQUESTED, pausable: true }, 'result'));
  app.setOpts({ access: 'ownable' });
  t.true(app.originalOpts().pausable, 'the baseline moved to the resolved options');
  t.false(app.drifted());
});

test('an unbuildable toolinput leaves no baseline, and the next apply captures one', t => {
  const app = makeApp();
  app.apply({ name: 'MyToken', symbol: 'MTK', premint: 'garbage' }, 'input');
  t.falsy(app.originalOpts());

  app.apply(REQUESTED, 'result');
  app.setOpts({ access: 'ownable' });
  t.truthy(app.originalOpts());
  t.false(app.drifted());
});
