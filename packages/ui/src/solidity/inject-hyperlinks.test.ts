import test from 'ava';
import { injectHyperlinks } from './inject-hyperlinks';

const escape = (code: string) => code.replace(/"/g, '&quot;');

test('links @chainlink/ace imports to the pinned source tag', t => {
  const code = escape(
    'import {PolicyProtectedBase} from "@chainlink/ace/packages/policy-management/src/core/PolicyProtectedBase.sol";',
  );
  const result = injectHyperlinks(code);
  t.true(
    result.includes(
      'href="https://github.com/smartcontractkit/chainlink-ace/blob/v1.2.0/packages/policy-management/src/core/PolicyProtectedBase.sol"',
    ),
  );
  t.true(result.includes('class="import-link"'));
});

test('does not link paths that escape the package with dot segments', t => {
  const code = escape('import {X} from "@chainlink/ace/packages/../../../etc/passwd";');
  t.false(injectHyperlinks(code).includes('chainlink-ace/blob'));
});

test('openzeppelin imports keep their links', t => {
  const code = escape('import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";');
  t.true(injectHyperlinks(code).includes('github.com/OpenZeppelin/openzeppelin-contracts/blob/'));
});
