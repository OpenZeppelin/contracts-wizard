import test from 'ava';
import { paymaster } from '.';

import type { PaymasterOptions } from './paymaster';
import { buildPaymaster } from './paymaster';
import { printContract } from './print';

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: PaymasterOptions) {
  test(title, t => {
    t.is(
      paymaster.print(opts),
      printContract(
        buildPaymaster({
          name: 'MyPaymaster',
          ...opts,
        }),
      ),
    );
  });
}

function testPaymaster(title: string, opts: Partial<PaymasterOptions>) {
  const fullOpts = {
    name: 'MyPaymaster',
    ...opts,
  };
  test(title, t => {
    const c = buildPaymaster(fullOpts);
    t.snapshot(printContract(c));
  });
  testAPIEquivalence(`${title} API equivalence`, fullOpts);
}

testAPIEquivalence('paymaster API default');

test('paymaster API assert defaults', async t => {
  t.is(paymaster.print(paymaster.defaults), paymaster.print());
});

for (const signer of [undefined, 'ERC7702', 'ECDSA', 'P256', 'RSA'] as const) {
  const title = `Signer${signer}`;

  testPaymaster(`${title} default`, {
    name: `Custom${title}`,
    signer,
  });

  testPaymaster(`${title} named`, {
    name: `Custom${title}`,
    signer,
  });
}
