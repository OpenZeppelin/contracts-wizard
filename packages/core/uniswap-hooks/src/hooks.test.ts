import test from 'ava';
// import type { OptionsError } from '@openzeppelin/wizard/src/error';
import { hooks } from './api';

import { buildHooks, type HooksOptions } from './hooks';
import { Hooks } from './hooks/';
import { printContract } from '@openzeppelin/wizard/src/print';
import { compatibleContractsSemver } from './utils/version';

function testHooks(title: string, opts: Partial<HooksOptions>) {
  test(title, t => {
    const c = buildHooks({
      ...hooks.defaults,
      ...opts,
    });
    t.snapshot(printContract(c, { compatibleSemver: compatibleContractsSemver }));
  });
}

// test all hooks
for (const key in Hooks) {
  const hook = Hooks[key as keyof typeof Hooks];
  testHooks(`basic ${hook.name}`, { hook: hook.name });
}

testHooks('access control (ownable)', { access: 'ownable' });

testHooks('access control (roles)', { access: 'roles' });

testHooks('access control (managed)', { access: 'managed' });

testHooks('pausable', { pausable: true });

testHooks('currency settler', { currencySettler: true });

testHooks('safeCast', { safeCast: true });

testHooks('transient storage', { transientStorage: true });

testHooks('shares erc20', { shares: { options: 'ERC20', name: 'MyShares', symbol: 'MSH' } });

testHooks('shares erc6909', { shares: { options: 'ERC6909', name: 'MyShares', symbol: 'MSH' } });
