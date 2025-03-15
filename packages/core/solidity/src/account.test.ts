import test from 'ava';
import { account } from '.';

import type { AccountOptions } from './account';
import { buildAccount } from './account';
import { printContract } from './print';

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: AccountOptions) {
  test(title, t => {
    t.is(
      account.print(opts),
      printContract(
        buildAccount({
          name: 'MyAccount',
          accountBase: 'Account',
          ERC7579: false,
          ...opts,
        }),
      ),
    );
  });
}

function testAccount(title: string, opts: Partial<AccountOptions>) {
  const fullOpts = {
    name: 'MyAccount',
    accountBase: 'Account' as const,
    ERC7579: false as const,
    ...opts,
  };
  test(title, t => {
    const c = buildAccount(fullOpts);
    t.snapshot(printContract(c));
  });
  testAPIEquivalence(`${title} API equivalence`, fullOpts);
}

testAPIEquivalence('account API default');

test('account API assert defaults', async t => {
  t.is(account.print(account.defaults), account.print());
});

for (const accountBase of [undefined, 'AccountCore', 'Account'] as const) {
  for (const signer of [undefined, 'ERC7702', 'ECDSA', 'P256', 'RSA'] as const) {
    let title = accountBase ?? 'DefaultAccount';
    if (signer) {
      title += ` with Signer${signer}`;
    }

    testAccount(`${title} named`, {
      name: `Custom${title}`,
      accountBase,
      signer,
    });

    testAccount(`${title} with ERC7579`, {
      accountBase,
      signer,
      ERC7579: 'AccountERC7579',
    });

    testAccount(`${title} with ERC7579 hooks`, {
      accountBase,
      signer,
      ERC7579: 'AccountERC7579Hooked',
    });
  }
}
