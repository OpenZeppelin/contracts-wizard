import test from 'ava';

import { printContract } from '../print';
import { buildERC20 } from '../erc20';
import { buildGovernor } from '../governor';
import { buildCustom } from '../custom';
import { tronPrintProfile, sanitizeTronOptions } from './transform-tron';

test('renames token standards in imports and inheritance', t => {
  const source = printContract(buildERC20({ name: 'My Token', symbol: 'MTK', votes: true }), tronPrintProfile);
  t.true(source.includes('import {TRC20} from "@openzeppelin/tron-contracts/token/TRC20/TRC20.sol";'));
  t.true(source.includes('@openzeppelin/tron-contracts/token/TRC20/extensions/TRC20Permit.sol'));
  t.regex(source, /contract MyToken is TRC20, TRC20Permit, TRC20Votes/);
  // No bare ERC token standards leak through.
  t.false(/\b(I)?ERC(20|721|1155|4626)/.test(source));
});

test('maps the upgradeable package, keeping base proxy utils on tron-contracts', t => {
  const source = printContract(
    buildERC20({ name: 'My Token', symbol: 'MTK', upgradeable: 'uups', access: 'ownable', mintable: true }),
    tronPrintProfile,
  );
  // Transpiled parents resolve from the upgradeable package...
  t.true(source.includes('@openzeppelin/tron-contracts-upgradeable/token/TRC20/TRC20Upgradeable.sol'));
  t.true(source.includes('{TRC20Upgradeable}'));
  // ...while the stateless proxy utilities stay on the base package.
  t.true(source.includes('@openzeppelin/tron-contracts/proxy/utils/UUPSUpgradeable.sol'));
  // The initializer keeps the base (TRC) name, no `Upgradeable` suffix.
  t.true(source.includes('__TRC20_init('));
  t.false(source.includes('@openzeppelin/contracts-upgradeable/'));
});

test('caps the pragma at the tron-solc maximum (0.8.26)', t => {
  const source = printContract(buildERC20({ name: 'T', symbol: 'T' }), tronPrintProfile);
  t.regex(source, /pragma solidity \^0\.8\.26;/);
});

test('does NOT corrupt user name/symbol/securityContact literals', t => {
  // A name and symbol that contain a token-standard string, and a matching
  // securityContact. A text regex would rewrite all three; the structured
  // transform leaves them untouched because they are user data, not symbols.
  const source = printContract(
    buildERC20({ name: 'My ERC20 Token', symbol: 'ERC20', info: { securityContact: 'ERC20-team@example.com' } }),
    tronPrintProfile,
  );
  t.true(source.includes('TRC20("My ERC20 Token", "ERC20")'), 'name/symbol literals preserved, base renamed');
  t.true(source.includes('@custom:security-contact ERC20-team@example.com'), 'securityContact preserved');
});

test('does NOT corrupt a user contract name that contains a token standard', t => {
  // The contract name is user data: it must match the filename/artifact the zip
  // writes, so it stays verbatim while inherited bases are still renamed.
  const source = printContract(buildCustom({ name: 'ERC20Token' }), tronPrintProfile);
  t.true(source.includes('contract ERC20Token'), 'contract name preserved verbatim');
});

test('leaves unrelated standards (ERC1363/ERC2981/ERC6909) verbatim', t => {
  // Path-root still maps to tron-contracts, but these symbols are not renamed.
  const source = printContract(buildERC20({ name: 'T', symbol: 'T', callback: true }), tronPrintProfile);
  if (source.includes('1363')) {
    t.true(source.includes('ERC1363'), 'ERC1363 stays verbatim');
  }
  t.pass();
});

test('renames the governor initializer base names to TRC where applicable', t => {
  const source = printContract(
    buildGovernor({ name: 'My Gov', delay: '1 day', period: '1 week', votes: 'erc20votes', upgradeable: 'uups' }),
    tronPrintProfile,
  );
  t.true(source.includes('@openzeppelin/tron-contracts-upgradeable/governance/GovernorUpgradeable.sol'));
  // IVotes interface stays on the base package, name unchanged.
  t.true(source.includes('@openzeppelin/tron-contracts/governance/utils/IVotes.sol'));
});

test('sanitizeTronOptions downgrades superchain bridging to custom', t => {
  t.deepEqual(sanitizeTronOptions({ crossChainBridging: 'superchain' }), { crossChainBridging: 'custom' });
  t.deepEqual(sanitizeTronOptions({ crossChainBridging: 'erc7786native' }), { crossChainBridging: 'erc7786native' });
  t.deepEqual(sanitizeTronOptions({ crossChainBridging: 'custom' }), { crossChainBridging: 'custom' });
  t.deepEqual(sanitizeTronOptions({}), {});
});
