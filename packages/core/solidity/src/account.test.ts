import test from 'ava';
import { account } from '.';

import type { AccountOptions } from './account';
import { buildAccount, buildFactory } from './account';
import { printContract } from './print';

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: AccountOptions) {
  test(title, t => {
    t.is(
      account.print(opts),
      printContract([
        buildAccount({
          name: 'MyAccount',
          signatureValidation: 'ERC7739',
          ERC721Holder: true,
          ERC1155Holder: true,
          batchedExecution: false,
          ERC7579Modules: false,
          ...opts,
        }),
        buildFactory({
          name: 'MyAccount',
          signatureValidation: 'ERC7739',
          ERC721Holder: true,
          ERC1155Holder: true,
          batchedExecution: false,
          ERC7579Modules: false,
          ...opts,
        }),
      ].filter(c => c !== null)),
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
    t.snapshot(account.print(fullOpts));
  });
  testAPIEquivalence(`${title} API equivalence`, fullOpts);
}

testAPIEquivalence('account API default');

test('account API assert defaults', async t => {
  t.is(account.print(account.defaults), account.print());
});

for (const signer of [false, 'ERC7702', 'ECDSA', 'P256', 'RSA', 'Multisig', 'MultisigWeighted'] as const) {
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
    signatureValidation: 'ERC1271',
    signer,
  });

  testAccount(`${title} with ERC7739`, {
    name: `Custom${title}ERC7739`,
    signatureValidation: 'ERC7739',
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
    batchedExecution: true,
  });

  testAccount(`${title} with ERC7579`, {
    signer,
    ERC7579Modules: 'AccountERC7579',
  });

  testAccount(`${title} with ERC7579 with ERC1271`, {
    signer,
    ERC7579Modules: 'AccountERC7579',
    signatureValidation: 'ERC1271',
  });

  testAccount(`${title} with ERC7579 with ERC7739`, {
    signer,
    ERC7579Modules: 'AccountERC7579',
    signatureValidation: 'ERC7739',
  });

  testAccount(`${title} with ERC7579 hooks`, {
    signer,
    ERC7579Modules: 'AccountERC7579Hooked',
  });
}
