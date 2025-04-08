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
          ERC1271: 'ERC7739',
          ERC721Holder: true,
          ERC1155Holder: true,
          ERC7821: false,
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
    ERC1271: false as const,
    ERC721Holder: false,
    ERC1155Holder: false,
    ERC7821: false as const,
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

for (const signer of [undefined, 'ERC7702', 'ECDSA', 'P256', 'RSA'] as const) {
  let title = 'Account';
  if (signer) {
    title += ` with Signer${signer}`;
  }

  testAccount(`${title} named`, {
    name: `Custom${title}`,
    signer,
  });

  testAccount(`${title} with ERC1271`, {
    name: `Custom${title}ERC1271`,
    ERC1271: 'ERC1271',
    signer,
  });

  testAccount(`${title} with ERC7739`, {
    name: `Custom${title}ERC7739`,
    ERC1271: 'ERC7739',
    signer,
  });

  testAccount(`${title} with ERC721Holder`, {
    name: `Custom${title}ERC721Holder`,
    ERC721Holder: true,
    signer,
  });

  testAccount(`${title} with ERC1155Holder`, {
    name: `Custom${title}ERC1155Holder`,
    ERC1155Holder: true,
    signer,
  });

  testAccount(`${title} with ERC721Holder and ERC1155Holder`, {
    name: `Custom${title}ERC721HolderERC1155Holder`,
    ERC721Holder: true,
    ERC1155Holder: true,
    signer,
  });

  testAccount(`${title} with ERC7821 Execution`, {
    signer,
    ERC7821: true,
  });

  testAccount(`${title} with ERC7579`, {
    signer,
    ERC7579: 'AccountERC7579',
  });

  testAccount(`${title} with ERC7579 hooks`, {
    signer,
    ERC7579: 'AccountERC7579Hooked',
  });
}
