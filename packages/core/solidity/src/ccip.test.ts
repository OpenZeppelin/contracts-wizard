import test from 'ava';
import { stablecoin, realWorldAsset } from './api';
import { buildStablecoin } from './stablecoin';
import { buildERC20, crossChainBridgingOptions, isAccessControlRequired, withDefaults } from './erc20';
import type { ERC20Options } from './erc20';
import { OptionsError } from './error';
import { printContract } from './print';
import { generateERC20Options } from './generate/erc20';
import { generateStablecoinOptions } from './generate/stablecoin';
import { sanitizeTronOptions } from './utils/transform-tron';

const ccip = 'chainlink-ccip' as const;
const options = { name: 'CandidateCCIPToken', symbol: 'CCT', permit: false, crossChainBridging: ccip };

test('CCIP is an explicit bridging option requiring roles', t => {
  t.true((crossChainBridgingOptions as readonly unknown[]).includes('chainlink-ccip'));
  t.true(isAccessControlRequired(options));
  t.is(withDefaults(options).access, 'roles');
  t.is(withDefaults({ ...options, access: false }).access, 'roles');
});

test('CCIP generates separate pool mint and burn permissions without initial pool grants', t => {
  const c = buildERC20(options);
  const source = printContract(c);
  t.deepEqual(
    c.constructorArgs.map(arg => arg.name),
    ['defaultAdmin', 'ccipAdmin'],
  );
  t.regex(source, /function mint\(address to, uint256 amount\) public onlyRole\(MINTER_ROLE\)/);
  t.regex(source, /function burn\(uint256 amount\) public onlyRole\(BURNER_ROLE\)/);
  t.regex(source, /_burn\(_msgSender\(\), amount\);/);
  t.deepEqual(
    c.constructorCode.filter(line => line.includes('_grantRole')),
    ['_grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);'],
  );
  t.notRegex(source, /_mint\(recipient|@chainlink|ERC20Bridgeable|7802|crosschainMint|crosschainBurn/);
});

test('CCIP admin is initialized from the constructor and rotated only by default admin', t => {
  const c = buildERC20(options);
  t.false(c.constructorCode.some(line => /InvalidAdmin/.test(line)));
  t.false(printContract(c).includes('InvalidAdmin'));
  const getAdmin = c.functions.find(fn => fn.name === 'getCCIPAdmin')!;
  t.deepEqual(getAdmin.returns, ['address']);
  t.is(getAdmin.mutability, 'view');
  const setAdmin = c.functions.find(fn => fn.name === 'setCCIPAdmin')!;
  t.deepEqual(setAdmin.modifiers, ['onlyRole(DEFAULT_ADMIN_ROLE)']);
  t.false(setAdmin.code.some(line => /InvalidAdmin/.test(line)));
  t.true((getAdmin.comments ?? []).some(line => /registerAdminViaGetCCIPAdmin/.test(line)));
  t.true((setAdmin.comments ?? []).some(line => /disables registration via getCCIPAdmin/.test(line)));
  t.true((setAdmin.comments ?? []).some(line => /does not disable the AccessControl path/.test(line)));
  t.false(setAdmin.code.some(line => /grantRole/.test(line)));
  t.true(setAdmin.code.some(line => /emit CCIPAdminTransferred\(previousCCIPAdmin, newCCIPAdmin\);/.test(line)));
});

for (const mintable of [undefined, true] as const) {
  test(`CCIP mintable=${mintable} never duplicates mint or weakens burn`, t => {
    const c = buildERC20({ ...options, mintable });
    const mint = c.functions.filter(fn => fn.name === 'mint');
    t.is(mint.length, 1);
    t.deepEqual(mint[0]!.code, ['_mint(to, amount);']);
    t.deepEqual(mint[0]!.modifiers, ['onlyRole(MINTER_ROLE)']);
    const burn = c.functions.find(fn => fn.name === 'burn')!;
    t.deepEqual(burn.modifiers, ['onlyRole(BURNER_ROLE)']);
    t.is(burn.override.size, 0);
    t.is(
      c.functions.find(fn => fn.name === 'burnFrom'),
      undefined,
    );
    t.false(c.constructorCode.some(line => /_grantRole\((MINTER|BURNER)_ROLE/.test(line)));
  });
}

for (const upgradeable of [false, 'transparent', 'uups'] as const) {
  for (const chainlinkAce of [false, true]) {
    test(`CCIP with Burnable preserves public burn and allowance-based burnFrom (ACE=${chainlinkAce}, upgradeable=${upgradeable})`, t => {
      const c = buildERC20({ ...options, burnable: true, chainlinkAce, upgradeable });
      const source = printContract(c);
      t.regex(source, /ERC20Burnable/);
      t.notRegex(source, /BURNER_ROLE/);
      t.deepEqual(
        c.functions.find(fn => fn.name === 'mint')!.modifiers,
        chainlinkAce ? ['onlyRole(MINTER_ROLE)', 'runPolicy'] : ['onlyRole(MINTER_ROLE)'],
      );
      for (const name of ['burn', 'burnFrom']) {
        const functions = c.functions.filter(fn => fn.name === name);
        t.is(functions.length, chainlinkAce ? 1 : 0);
        if (chainlinkAce) {
          t.deepEqual(functions[0]!.modifiers, ['runPolicy']);
          t.is(functions[0]!.override.size, 1);
          t.regex(source, new RegExp(`super\\.${name}\\(`));
        }
      }
    });
  }
}

for (const [kind, print] of Object.entries({ stablecoin: stablecoin.print, realWorldAsset: realWorldAsset.print })) {
  for (const chainlinkAce of [false, true]) {
    test(`CCIP with Burnable is supported by ${kind} (ACE=${chainlinkAce})`, t => {
      const source = print({ ...options, burnable: true, chainlinkAce });
      t.regex(source, /ERC20Burnable/);
      t.notRegex(source, /BURNER_ROLE/);
      if (chainlinkAce) {
        t.regex(source, /function burn\(uint256 amount\) public override runPolicy/);
        t.regex(source, /function burnFrom\(address account, uint256 amount\) public override runPolicy/);
      }
    });
  }
}

for (const decimals of ['6', '18']) {
  for (const upgradeable of [false, 'transparent', 'uups'] as const) {
    test(`CCIP decimals=${decimals} upgradeable=${upgradeable} supports chain-bound premint`, t => {
      const c = buildERC20({ ...options, decimals, upgradeable, premint: '1.5', premintChainId: '10' });
      const source = printContract(c);
      t.regex(source, /if \(block.chainid == 10\)/);
      t.regex(source, /_mint\(recipient, 15 \* 10 \*\* \(decimals\(\) - 1\)\);/);
      if (decimals === '6') t.regex(source, /return 6;/);
      if (upgradeable) {
        t.regex(source, /function initialize\(/);
        t.regex(source, /_disableInitializers\(\);/);
        t.regex(source, /@custom:storage-location erc7201:myProject.CandidateCCIPToken/);
        t.notRegex(source, /address private _ccipAdmin;/);
      }
      if (upgradeable === 'uups') t.regex(source, /onlyRole\(UPGRADER_ROLE\)/);
    });
  }
}

test('CCIP premint requires a chain id', t => {
  const error = t.throws(() => buildERC20({ ...options, premint: '1' }), { instanceOf: OptionsError });
  t.regex(error!.messages.premintChainId!, /Chain ID is required/);
});

test('CCIP compile option matrices include only supported access modes', t => {
  for (const generator of [generateERC20Options, generateStablecoinOptions]) {
    const candidates = [...generator()].filter(opts => opts.crossChainBridging === ccip);
    t.true(candidates.length > 0);
    t.true(candidates.every(opts => opts.access === 'roles'));
    t.true(candidates.some(opts => opts.burnable));
  }
});

test('CCIP is rejected explicitly for TRON', t => {
  const error = t.throws(() => sanitizeTronOptions({ ...options, kind: 'ERC20' }), { instanceOf: OptionsError });
  t.regex(error!.messages.crossChainBridging!, /CCIP.*TRON/);
});

for (const [kind, generate] of Object.entries({
  buildStablecoin,
  stablecoin: stablecoin.print,
  realWorldAsset: realWorldAsset.print,
})) {
  for (const upgradeable of ['transparent', 'uups'] as const) {
    test(`CCIP ${kind} rejects unsupported ${upgradeable} instead of silently dropping it`, t => {
      const error = t.throws(() => generate({ ...options, upgradeable }), { instanceOf: OptionsError });
      t.regex(error!.messages.upgradeable!, /CCIP.*upgrade/);
    });
  }
}

test('ccip auto-enables mintable when unset', t => {
  const source = printContract(buildERC20(options));
  t.regex(source, /function mint\(address to, uint256 amount\)/);
});

test('ccip with explicit mintable false is rejected', t => {
  const error = t.throws(() => buildERC20({ ...options, mintable: false }), { instanceOf: OptionsError });
  t.is(error!.messages.mintable, 'Chainlink CCIP requires the Mintable feature');
});

test('ccip with explicit mintable true stays accepted', t => {
  t.notThrows(() => buildERC20({ ...options, mintable: true }));
});

test('ccip with ownable reports the conflict on both option keys, each with its own sentence', t => {
  const error = t.throws(() => buildERC20({ ...options, access: 'ownable' }), { instanceOf: OptionsError });
  t.is(
    error!.messages.crossChainBridging,
    'This Wizard integration does not support Chainlink CCIP with Ownable access.',
  );
  t.is(
    error!.messages.access,
    "This Wizard integration does not support Ownable access with Chainlink CCIP, because the pool would have to be the token's owner to mint. Use Roles.",
  );
});

test('ccip with managed reports the conflict on both option keys, each with its own sentence', t => {
  const error = t.throws(() => buildERC20({ ...options, access: 'managed' }), { instanceOf: OptionsError });
  t.is(
    error!.messages.crossChainBridging,
    'This Wizard integration does not support Chainlink CCIP with Managed access.',
  );
  t.is(
    error!.messages.access,
    'This Wizard integration does not support Managed access with Chainlink CCIP. Use Roles.',
  );
});

for (const upgradeable of [false, 'transparent', 'uups'] as const) {
  test(`setCCIPAdmin emits CCIPAdminTransferred like BurnMintERC20 (upgradeable=${upgradeable})`, t => {
    const source = printContract(buildERC20({ ...options, upgradeable }));
    t.is(
      source.match(/event CCIPAdminTransferred\(address indexed previousAdmin, address indexed newAdmin\);/g)?.length,
      1,
    );
    t.regex(source, /address previousCCIPAdmin = (_ccipAdmin|\$\.ccipAdmin);/);
    t.regex(source, /emit CCIPAdminTransferred\(previousCCIPAdmin, newCCIPAdmin\);/);
  });
}

test('combined ACE+CCIP declares the admin event once', t => {
  const source = printContract(buildERC20({ ...options, chainlinkAce: true }));
  t.is(source.match(/event CCIPAdminTransferred/g)?.length, 1);
});

test('raw JS legacy ccip value is rejected after the rename', t => {
  const error = t.throws(
    () => buildERC20({ ...options, crossChainBridging: 'ccip' as unknown as ERC20Options['crossChainBridging'] }),
    { instanceOf: OptionsError },
  );
  t.truthy(error!.messages.crossChainBridging);
});

test('raw JS crossChainBridging typo is rejected, not degraded to custom', t => {
  const error = t.throws(
    () => buildERC20({ ...options, crossChainBridging: 'CCIP' as unknown as ERC20Options['crossChainBridging'] }),
    { instanceOf: OptionsError },
  );
  t.truthy(error!.messages.crossChainBridging);
});

test('combined ACE+CCIP output has no burnFrom entry point', t => {
  const source = printContract(buildERC20({ ...options, chainlinkAce: true }));
  t.false(source.includes('burnFrom'));
});
