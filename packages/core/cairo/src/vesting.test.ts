import test from 'ava';
import type { OptionsError } from '.';
import { vesting } from '.';
import type { VestingOptions } from './vesting';
import { buildVesting } from './vesting';
import { printContract } from './print';

const defaults: VestingOptions = {
  name: 'MyVesting',
  startDate: '',
  duration: '0 day',
  cliffDuration: '0 day',
  schedule: 'linear',
};

const CUSTOM_NAME = 'CustomVesting';
const CUSTOM_DATE = '2024-12-31T23:59';
const CUSTOM_DURATION = '36 months';
const CUSTOM_CLIFF = '90 days';

//
// Test helpers
//

function testVesting(title: string, opts: Partial<VestingOptions>) {
  test(title, t => {
    const c = buildVesting({
      ...defaults,
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

function testAPIEquivalence(title: string, opts?: VestingOptions) {
  test(title, t => {
    t.is(
      vesting.print(opts),
      printContract(
        buildVesting({
          ...defaults,
          ...opts,
        }),
      ),
    );
  });
}

//
// Snapshot tests
//

testVesting('custom name', {
  name: CUSTOM_NAME,
});

testVesting('custom start date', {
  startDate: CUSTOM_DATE,
});

testVesting('custom duration', {
  duration: CUSTOM_DURATION,
});

testVesting('custom cliff', {
  duration: CUSTOM_DURATION,
  cliffDuration: CUSTOM_CLIFF,
});

testVesting('custom schedule', {
  schedule: 'custom',
});

testVesting('all custom settings', {
  startDate: CUSTOM_DATE,
  duration: CUSTOM_DURATION,
  cliffDuration: CUSTOM_CLIFF,
  schedule: 'custom',
});

//
// API tests
//

testAPIEquivalence('API custom name', {
  ...defaults,
  name: CUSTOM_NAME,
});

testAPIEquivalence('API custom start date', {
  ...defaults,
  startDate: CUSTOM_DATE,
});

testAPIEquivalence('API custom duration', {
  ...defaults,
  duration: CUSTOM_DURATION,
});

testAPIEquivalence('API custom cliff', {
  ...defaults,
  duration: CUSTOM_DURATION,
  cliffDuration: CUSTOM_CLIFF,
});

testAPIEquivalence('API custom schedule', {
  ...defaults,
  schedule: 'custom',
});

testAPIEquivalence('API all custom settings', {
  ...defaults,
  startDate: CUSTOM_DATE,
  duration: CUSTOM_DURATION,
  cliffDuration: CUSTOM_CLIFF,
  schedule: 'custom',
});

test('cliff too high', async t => {
  const error = t.throws(() =>
    buildVesting({
      ...defaults,
      duration: '20 days',
      cliffDuration: '21 days',
    }),
  );
  t.is(
    (error as OptionsError).messages.cliffDuration,
    'Cliff duration must be less than or equal to the total duration',
  );
});
