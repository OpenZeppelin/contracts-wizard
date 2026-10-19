import test from 'ava';
import { erc20, stablecoin, realWorldAsset } from './api';
import { buildERC20, withDefaults, isAccessControlRequired, type ERC20Options } from './erc20';
import { OptionsError } from './error';
import { printContract } from './print';
import { generateERC20Options } from './generate/erc20';
import { generateStablecoinOptions } from './generate/stablecoin';
import { sanitizeTronOptions } from './utils/transform-tron';

const ace = { name: 'ACE Candidate', symbol: 'ACE', chainlinkAce: true } satisfies ERC20Options;

test('ACE normalizes omitted and false access to ownable and remains opt-in', t => {
  t.is(withDefaults(ace).access, 'ownable');
  t.is(withDefaults({ ...ace, access: false }).access, 'ownable');
  t.true(isAccessControlRequired(ace));
  t.notRegex(erc20.print({ name: 'Plain', symbol: 'PLN' }), /PolicyProtected|runPolicy/);
});

for (const access of ['ownable', 'roles'] as const) {
  for (const upgradeable of [false, 'transparent', 'uups'] as const) {
    for (const burnable of [false, true]) {
      for (const mintable of [false, true]) {
        test(`ACE ${access} ${upgradeable} burn=${burnable} mint=${mintable} protects exposed operations`, t => {
          const c = buildERC20({ ...ace, access, upgradeable, burnable, mintable });
          for (const name of [
            'transfer',
            'transferFrom',
            ...(burnable ? ['burn', 'burnFrom'] : []),
            ...(mintable ? ['mint'] : []),
          ]) {
            const fn = c.functions.find(fn => fn.name === name);
            t.truthy(fn, name);
            t.is(fn!.modifiers.at(-1), 'runPolicy', name);
            if (name === 'mint')
              t.deepEqual(fn!.modifiers, [access === 'ownable' ? 'onlyOwner' : 'onlyRole(MINTER_ROLE)', 'runPolicy']);
          }
          for (const name of ['_update', '_approve', 'approve', 'permit']) {
            t.false(c.functions.find(fn => fn.name === name)?.modifiers.includes('runPolicy') ?? false);
          }
          t.is(c.functions.filter(fn => fn.name === 'mint').length, mintable ? 1 : 0);
          t.is(c.functions.filter(fn => fn.name === 'burn').length, burnable ? 1 : 0);
          const authorize = c.functions.find(fn => fn.name === '_authorizeAttachPolicyEngine')!;
          t.deepEqual(authorize.modifiers, [access === 'ownable' ? 'onlyOwner' : 'onlyRole(DEFAULT_ADMIN_ROLE)']);
          t.deepEqual(authorize.code, []);
          const source = printContract(c);
          t.regex(
            source,
            /@chainlink\/ace\/packages\/policy-management\/src\/core\/PolicyProtectedBase(?:Upgradeable)?\.sol/,
          );
          t.notRegex(source, /Flexible|UpgradeableUpgradeable|function attachPolicyEngine/);
          if (upgradeable) {
            t.regex(source, /__PolicyProtectedBase_init\(policyEngine\);/);
            t.regex(source, /_disableInitializers\(\);/);
            t.is((source.match(/__Ownable_init\(initialOwner\)/g) ?? []).length, access === 'ownable' ? 1 : 0);
          } else {
            t.regex(source, /PolicyProtectedBase\(policyEngine\)/);
            t.is((source.match(/Ownable\(initialOwner\)/g) ?? []).length, access === 'ownable' ? 1 : 0);
          }
          if (access === 'roles') {
            t.false(source.includes('InvalidAdmin'));
            t.regex(
              source,
              /override\((?:AccessControl(?:Upgradeable)?, PolicyProtectedBase(?:Upgradeable)?|PolicyProtectedBase(?:Upgradeable)?, AccessControl(?:Upgradeable)?)\)/,
            );
          }
        });
      }
    }
  }
}

for (const upgradeable of [false, 'transparent', 'uups'] as const) {
  test(`combined ACE+CCIP ${upgradeable} preserves pool role gates`, t => {
    const c = buildERC20({ ...ace, crossChainBridging: 'chainlink-ccip', upgradeable, mintable: true });
    t.deepEqual(c.functions.find(fn => fn.name === 'mint')!.modifiers, ['onlyRole(MINTER_ROLE)', 'runPolicy']);
    t.deepEqual(c.functions.find(fn => fn.name === 'burn')!.modifiers, ['onlyRole(BURNER_ROLE)', 'runPolicy']);
    t.is(c.functions.filter(fn => fn.name === 'burn').length, 1);
    t.is(c.functions.find(fn => fn.name === 'burn')!.override.size, 0);
    t.is(c.functions.filter(fn => fn.name === 'burnFrom').length, 0);
    t.false(c.constructorArgs.some(arg => arg.name === 'initialOwner'));
    t.deepEqual(
      c.constructorCode.filter(line => /_grantRole\((MINTER|BURNER)_ROLE/.test(line)),
      [],
    );
  });
}

test('ACE candidate constructor has one owner and one required engine', t => {
  const c = buildERC20({ ...ace, access: 'ownable', mintable: true, burnable: true });
  t.deepEqual(
    c.constructorArgs.map(arg => arg.name),
    ['initialOwner', 'policyEngine'],
  );
  t.is(c.name, 'ACECandidate');
});

const aceRejections = [
  [
    'access',
    'managed',
    'This Wizard integration does not support Managed access with Chainlink ACE. Use Ownable or Roles.',
    'This Wizard integration does not support Chainlink ACE with Managed access.',
  ],
  [
    'callback',
    true,
    'This Wizard integration does not support Callback (ERC-1363) with Chainlink ACE.',
    'This Wizard integration does not support Chainlink ACE with Callback (ERC-1363).',
  ],
  [
    'flashmint',
    true,
    'This Wizard integration does not support Flash Minting with Chainlink ACE.',
    'This Wizard integration does not support Chainlink ACE with Flash Minting.',
  ],
  [
    'premint',
    '1',
    'This Wizard integration does not support a premint with Chainlink ACE.',
    'This Wizard integration does not support Chainlink ACE with a premint.',
  ],
  [
    'crossChainBridging',
    'custom',
    'This Wizard integration supports Chainlink ACE only with Chainlink CCIP as the bridge mode. Select CCIP, disable Crosschain Bridging, or disable Chainlink ACE.',
    'This Wizard integration supports Chainlink ACE only with Chainlink CCIP as the bridge mode. Select CCIP, disable Crosschain Bridging, or disable Chainlink ACE.',
  ],
  [
    'crossChainBridging',
    'erc7786native',
    'This Wizard integration supports Chainlink ACE only with Chainlink CCIP as the bridge mode. Select CCIP, disable Crosschain Bridging, or disable Chainlink ACE.',
    'This Wizard integration supports Chainlink ACE only with Chainlink CCIP as the bridge mode. Select CCIP, disable Crosschain Bridging, or disable Chainlink ACE.',
  ],
  [
    'crossChainBridging',
    'superchain',
    'This Wizard integration supports Chainlink ACE only with Chainlink CCIP as the bridge mode. Select CCIP, disable Crosschain Bridging, or disable Chainlink ACE.',
    'This Wizard integration supports Chainlink ACE only with Chainlink CCIP as the bridge mode. Select CCIP, disable Crosschain Bridging, or disable Chainlink ACE.',
  ],
] as const;

for (const [field, value, siblingMessage, aceMessage] of aceRejections) {
  test(`ACE rejects ${field}=${value} naming both options on both keys`, t => {
    const error = t.throws(() => buildERC20({ ...ace, [field]: value }), { instanceOf: OptionsError });
    t.is(error!.messages[field], siblingMessage);
    t.is(error!.messages.chainlinkAce, aceMessage);
  });
}

for (const [kind, print] of Object.entries({ stablecoin: stablecoin.print, realWorldAsset: realWorldAsset.print })) {
  for (const upgradeable of ['transparent', 'uups'] as const) {
    test(`ACE ${kind} rejects ${upgradeable} before stablecoin normalization`, t => {
      const error = t.throws(() => print({ ...ace, upgradeable }), { instanceOf: OptionsError });
      t.regex(error!.messages.upgradeable!, /ACE.*upgrade/);
    });
  }
}

test('ACE is rejected explicitly for TRON', t => {
  const error = t.throws(() => sanitizeTronOptions({ ...ace, kind: 'ERC20' }), { instanceOf: OptionsError });
  t.regex(error!.messages.chainlinkAce!, /ACE.*TRON/);
});

test('compile matrices cover ACE and combined configurations with only valid combinations', t => {
  for (const generate of [generateERC20Options, generateStablecoinOptions]) {
    const candidates = [...generate()].filter(opts => opts.chainlinkAce === true);
    t.true(candidates.length > 0);
    t.true(candidates.some(opts => opts.crossChainBridging === 'chainlink-ccip'));
    t.true(candidates.some(opts => !opts.crossChainBridging && opts.access === 'ownable'));
    for (const opts of candidates) t.notThrows(() => buildERC20(opts));
  }
});

for (const [kind, print] of Object.entries({
  erc20: erc20.print,
  stablecoin: stablecoin.print,
  realWorldAsset: realWorldAsset.print,
})) {
  for (const [label, chainlinkAce] of [
    ['legacy value', 'ace'],
    ['typo', 'acee'],
    ['unknown string', 'other'],
    ['capitalized', 'ACE'],
    ['empty string', ''],
    ['object', {}],
    ['array', []],
    ['zero', 0],
    ['one', 1],
    ['null', null],
    ['symbol', Symbol('ace')],
  ] as const) {
    test(`${kind} rejects raw JavaScript chainlinkAce ${label}`, t => {
      const options = { name: 'Strict Compliance', symbol: 'SC', chainlinkAce } as unknown as ERC20Options;
      const error = t.throws(() => print(options), { instanceOf: OptionsError });
      t.regex(error!.messages.chainlinkAce!, /boolean/);
    });
  }
  test(`${kind} accepts omitted, undefined, false and true chainlinkAce`, t => {
    const options = { name: 'Strict Compliance', symbol: 'SC' };
    const omitted = print(options);
    t.is(print({ ...options, chainlinkAce: undefined }), omitted);
    t.is(print({ ...options, chainlinkAce: false }), omitted);
    t.notRegex(omitted, /PolicyProtected|runPolicy/);
    t.regex(print({ ...options, chainlinkAce: true }), /PolicyProtectedBase/);
    t.regex(print({ ...options, chainlinkAce: true }), /runPolicy/);
  });
}
