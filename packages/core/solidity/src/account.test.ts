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
          signatureValidation: 'ERC7739',
          ERC721Holder: true,
          ERC1155Holder: true,
          batchedExecution: false,
          ERC7579Modules: false,
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

function format(upgradeable: false | 'uups' | 'transparent') {
  switch (upgradeable) {
    case false:
      return 'non-upgradeable';
    case 'uups':
      return 'upgradeable uups';
    case 'transparent':
      return 'upgradeable transparent';
  }
}

for (const signer of [false, 'ERC7702', 'ECDSA', 'P256', 'RSA', 'Multisig', 'MultisigWeighted'] as const) {
  for (const upgradeable of [false, 'uups', 'transparent'] as const) {
    let title = 'Account';
    if (signer) {
      title += ` with Signer${signer}`;
    }

    testAccount(`${title} named ${format(upgradeable)}`, {
      name: `Custom${title}`,
      signer,
      upgradeable,
    });

    testAccount(`${title} with ERC1271 ${format(upgradeable)}`, {
      name: `Custom${title}ERC1271`,
      signatureValidation: 'ERC1271',
      signer,
      upgradeable,
    });

    testAccount(`${title} with ERC7739 ${format(upgradeable)}`, {
      name: `Custom${title}ERC7739`,
      signatureValidation: 'ERC7739',
      signer,
      upgradeable,
    });

    testAccount(`${title} with ERC721Holder ${format(upgradeable)}`, {
      name: `Custom${title}ERC721Holder`,
      ERC721Holder: true,
      signer,
      upgradeable,
    });

    testAccount(`${title} with ERC1155Holder ${format(upgradeable)}`, {
      name: `Custom${title}ERC1155Holder`,
      ERC1155Holder: true,
      signer,
      upgradeable,
    });

    testAccount(`${title} with ERC721Holder and ERC1155Holder ${format(upgradeable)}`, {
      name: `Custom${title}ERC721HolderERC1155Holder`,
      ERC721Holder: true,
      ERC1155Holder: true,
      signer,
      upgradeable,
    });

    testAccount(`${title} with ERC7821 Execution ${format(upgradeable)}`, {
      signer,
      upgradeable,
      batchedExecution: true,
    });

    testAccount(`${title} with ERC7579 ${format(upgradeable)}`, {
      signer,
      upgradeable,
      ERC7579Modules: 'AccountERC7579',
    });

    testAccount(`${title} with ERC7579 with ERC1271 ${format(upgradeable)}`, {
      signer,
      upgradeable,
      ERC7579Modules: 'AccountERC7579',
      signatureValidation: 'ERC1271',
    });

    testAccount(`${title} with ERC7579 with ERC7739 ${format(upgradeable)}`, {
      signer,
      upgradeable,
      ERC7579Modules: 'AccountERC7579',
      signatureValidation: 'ERC7739',
    });

    testAccount(`${title} with ERC7579 hooks ${format(upgradeable)}`, {
      signer,
      upgradeable,
      ERC7579Modules: 'AccountERC7579Hooked',
    });
  }
}
