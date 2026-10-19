import test from 'ava';
import type { ExecutionContext } from 'ava';
import { erc20, stablecoin, realWorldAsset } from './api';
import { buildERC20, type ERC20Options } from './erc20';
import { printContract } from './print';
import { OptionsError } from './error';
import { ACE_GRANTS_URL, ACE_LICENSE, ACE_LICENSE_URL, aceImportNotice, hasACE } from './ace-licensing';
import { readFileSync } from 'fs';
import path from 'path';
import type JSZip from 'jszip';
import { zipHardhat } from './zip-hardhat';
import { zipFoundry } from './zip-foundry';
import { getACELegalFiles } from './zip-shared';
import contracts from '../openzeppelin-contracts';

const apis = [
  ['erc20', erc20],
  ['stablecoin', stablecoin],
  ['rwa', realWorldAsset],
] as const;

const aceConfigs = {
  ace: { chainlinkAce: true },
  'ccip+ace': { crossChainBridging: 'chainlink-ccip', access: 'roles', chainlinkAce: true },
} as const;

const controlConfigs = {
  plain: {},
  ccip: { crossChainBridging: 'chainlink-ccip', access: 'roles' },
} as const;

const licenses = [undefined, 'MIT', 'Apache-2.0', 'BUSL-1.1'] as const;

const noticeBlock = [
  '// Imports Chainlink ACE components licensed under BUSL-1.1.',
  '// License: https://github.com/smartcontractkit/chainlink-ace/blob/v1.2.0/LICENSE',
].join('\n');

/** The notice must sit directly above every ACE import line and nowhere else. */
function assertNoticeBeforeAceImports(t: ExecutionContext, source: string) {
  const lines = source.split('\n');
  const aceImports = lines.flatMap((l, i) => (/^import .* from ".*@chainlink\/ace\//.test(l) ? [i] : []));
  t.true(aceImports.length > 0, 'expected an ACE import');
  for (const i of aceImports) {
    t.is(lines.slice(i - 2, i).join('\n'), noticeBlock);
  }
  t.is(source.split(noticeBlock).length - 1, aceImports.length);
  t.false(source.includes('Additional use grants'));
}

function info(license: string | undefined) {
  return license === undefined
    ? { securityContact: 'security@example.com' }
    : { license, securityContact: 'security@example.com' };
}

test('ACE licensing constants pin the installed release', t => {
  t.is(ACE_LICENSE, 'BUSL-1.1');
  t.is(ACE_LICENSE_URL, 'https://github.com/smartcontractkit/chainlink-ace/blob/v1.2.0/LICENSE');
  t.is(ACE_GRANTS_URL, 'https://github.com/smartcontractkit/chainlink-ace/blob/v1.2.0/chainlink-ace-License-grants');
  t.is(aceImportNotice.join('\n'), noticeBlock);
});

for (const [name, api] of apis) {
  for (const [configName, config] of Object.entries(aceConfigs)) {
    for (const license of licenses) {
      test(`${name} ${configName} with license ${license ?? 'default'} is labeled BUSL-1.1`, t => {
        const source = api.print({ name: 'MyToken', symbol: 'MTK', ...config, info: info(license) });
        t.true(source.startsWith('// SPDX-License-Identifier: BUSL-1.1\n'));
        t.is(source.match(/SPDX-License-Identifier:/g)?.length, 1);
        t.true(source.includes('/// @custom:security-contact security@example.com'));
        assertNoticeBeforeAceImports(t, source);
      });
    }
  }

  for (const [configName, config] of Object.entries(controlConfigs)) {
    for (const license of licenses) {
      test(`${name} ${configName} with license ${license ?? 'default'} keeps its license and has no ACE notice`, t => {
        const source = api.print({ name: 'MyToken', symbol: 'MTK', ...config, info: info(license) });
        t.true(source.startsWith(`// SPDX-License-Identifier: ${license ?? 'MIT'}\n`));
        t.false(source.includes('Chainlink ACE'));
      });
    }
  }
}

for (const access of ['ownable', 'roles'] as const) {
  for (const upgradeable of [false, 'transparent', 'uups'] as const) {
    test(`ERC20 ACE ${access} ${upgradeable} builds and prints BUSL-1.1 with the import notice`, t => {
      const c = buildERC20({
        name: 'MyToken',
        symbol: 'MTK',
        chainlinkAce: true,
        access,
        upgradeable,
        info: { license: 'MIT' },
      });
      t.is(c.license, 'BUSL-1.1');
      t.true(hasACE(c));
      const source = printContract(c);
      t.true(source.startsWith('// SPDX-License-Identifier: BUSL-1.1\n'));
      t.regex(source, upgradeable ? /PolicyProtectedBaseUpgradeable\.sol/ : /PolicyProtectedBase\.sol/);
      assertNoticeBeforeAceImports(t, source);
    });
  }
}

for (const burnable of [false, true]) {
  test(`ERC20 CCIP+ACE roles burnable=${burnable} is labeled BUSL-1.1`, t => {
    const opts: ERC20Options = {
      name: 'MyToken',
      symbol: 'MTK',
      crossChainBridging: 'chainlink-ccip',
      access: 'roles',
      chainlinkAce: true,
      burnable,
      info: { license: 'Apache-2.0' },
    };
    t.is(buildERC20(opts).license, 'BUSL-1.1');
    assertNoticeBeforeAceImports(t, erc20.print(opts));
  });
}

test('ACE import notice follows transformed import paths', t => {
  const c = buildERC20({ name: 'MyToken', symbol: 'MTK', chainlinkAce: true });
  const source = printContract(c, { transformImport: p => ({ ...p, path: `https://example.com/${p.path}` }) });
  t.regex(source, /from "https:\/\/example\.com\/@chainlink\/ace\//);
  assertNoticeBeforeAceImports(t, source);
});

test('ACE does not add the notice to OpenZeppelin imports', t => {
  const source = erc20.print({ name: 'MyToken', symbol: 'MTK', chainlinkAce: true });
  const lines = source.split('\n');
  const ozImport = lines.findIndex(l => l.includes('@openzeppelin/contracts/token/ERC20/ERC20.sol'));
  t.false(lines[ozImport - 1]!.startsWith('// License: '));
});

test('ACE still rejects line breaks in the license before labeling', t => {
  const error = t.throws(() =>
    erc20.print({ name: 'MyToken', symbol: 'MTK', chainlinkAce: true, info: { license: 'MIT\ncontract X {}' } }),
  );
  t.true(error instanceof OptionsError);
  t.is((error as OptionsError).messages.license, 'Must not contain line breaks');
});

test('ACE does not mutate the caller info', t => {
  const callerInfo = { license: 'MIT' };
  erc20.print({ name: 'MyToken', symbol: 'MTK', chainlinkAce: true, info: callerInfo });
  t.deepEqual(callerInfo, { license: 'MIT' });
});

// ===== Exported archives carry the original ACE legal texts =====

const ACE_LEGAL_FILES = ['LICENSE', 'chainlink-ace-License-grants'] as const;
const installedLegalText = (file: string) => readFileSync(require.resolve(`@chainlink/ace/${file}`), 'utf8');

const aceZipConfigs = {
  'ownable false': { access: 'ownable', upgradeable: false },
  'ownable transparent': { access: 'ownable', upgradeable: 'transparent' },
  'roles uups': { access: 'roles', upgradeable: 'uups' },
  'ccip+ace roles': { crossChainBridging: 'chainlink-ccip', access: 'roles', upgradeable: false },
  'ccip+ace roles burnable uups': {
    crossChainBridging: 'chainlink-ccip',
    access: 'roles',
    burnable: true,
    upgradeable: 'uups',
  },
} as const;

const exporters = [
  ['Hardhat', zipHardhat],
  ['Foundry', zipFoundry],
] as const;

async function zipText(zip: JSZip, file: string): Promise<string> {
  const item = zip.file(file);
  if (item === null) throw new Error(`${file} missing from archive`);
  return item.async('string');
}

test('checked-in and bundled ACE legal texts match the installed pinned package', t => {
  for (const file of ACE_LEGAL_FILES) {
    const installed = installedLegalText(file);
    t.is(readFileSync(path.join(__dirname, '..', 'third-party-licenses', 'chainlink-ace', file), 'utf8'), installed);
    t.is(contracts.sources[`@chainlink/ace/${file}`], installed);
  }
});

test('ACE legal files fail clearly when a bundled resource is missing', t => {
  const error = t.throws(() => getACELegalFiles({ '@chainlink/ace/LICENSE': 'x' }));
  t.regex(error!.message, /chainlink-ace-License-grants/);
});

for (const [exporterName, exporter] of exporters) {
  for (const [configName, config] of Object.entries(aceZipConfigs)) {
    test(`ACE ${exporterName} ${configName} archive ships original legal texts and BUSL metadata`, async t => {
      const opts = {
        kind: 'ERC20',
        name: 'MyToken',
        symbol: 'MTK',
        chainlinkAce: true,
        info: { license: 'MIT' },
        ...config,
      } as const;
      const c = buildERC20(opts);
      const zip = await exporter(c, opts);
      for (const file of ACE_LEGAL_FILES) {
        t.is(await zipText(zip, `third-party-licenses/chainlink-ace/${file}`), installedLegalText(file));
      }
      const pkg = JSON.parse(await zipText(zip, 'package.json'));
      const lock = JSON.parse(await zipText(zip, 'package-lock.json'));
      t.is(pkg.license, 'BUSL-1.1');
      t.is(lock.packages[''].license, 'BUSL-1.1');
      t.is(lock.packages['node_modules/@chainlink/ace'].license, 'BUSL-1.1');
      const sources =
        exporterName === 'Hardhat'
          ? ['contracts/MyToken.sol']
          : ['src/MyToken.sol', 'test/MyToken.t.sol', 'script/MyToken.s.sol'];
      for (const file of sources) {
        t.true((await zipText(zip, file)).startsWith('// SPDX-License-Identifier: BUSL-1.1\n'), file);
      }
      assertNoticeBeforeAceImports(t, await zipText(zip, sources[0]!));
    });
  }

  for (const [configName, config] of Object.entries(controlConfigs)) {
    test(`${exporterName} ${configName} archive has no ACE legal files`, async t => {
      const opts = { kind: 'ERC20', name: 'LicenseCheck', symbol: 'LC', ...config } as const;
      const zip = await exporter(buildERC20(opts), opts);
      const files = Object.keys(zip.files);
      t.false(files.some(f => f.startsWith('third-party-licenses/')));
      t.false(files.some(f => ['LICENSE', 'chainlink-ace-License-grants'].includes(path.posix.basename(f))));
      t.true(files.some(f => f.endsWith('LicenseCheck.sol')));
    });
  }
}

test('Foundry ACE metadata does not mutate the imported environment JSON', async t => {
  const opts = { kind: 'ERC20', name: 'MyToken', symbol: 'MTK', chainlinkAce: true } as const;
  await zipFoundry(buildERC20(opts), opts);
  const { default: pkg } = await import('./environments/foundry/ace/package.json');
  const { default: lock } = await import('./environments/foundry/ace/package-lock.json');
  t.false('license' in pkg);
  t.false('license' in lock.packages['']);
});

for (const [exporterName, exporter] of exporters) {
  test(`ACE ${exporterName} README explains the license and links the shipped files`, async t => {
    const opts = { kind: 'ERC20', name: 'MyToken', symbol: 'MTK', chainlinkAce: true } as const;
    const zip = await exporter(buildERC20(opts), opts);
    const readme = await zipText(zip, 'README.md');
    t.regex(readme, /## ACE licensing/);
    t.regex(readme, /The generated token is labeled BUSL-1\.1 and imports ACE components licensed under BUSL-1\.1\./);
    t.true(readme.includes('// SPDX-License-Identifier: BUSL-1.1'));
    for (const file of ACE_LEGAL_FILES) {
      const link = `third-party-licenses/chainlink-ace/${file}`;
      t.true(readme.includes(`](${link})`), link);
      t.truthy(zip.file(link), `${link} must resolve inside the archive`);
    }
    t.true(readme.includes('https://github.com/smartcontractkit/chainlink-ace/tree/v1.2.0'));
    t.regex(readme, /PolicyEngine proxy/);
  });
}

test('core README renders the ACE licensing section outside any code fence', t => {
  const readme = readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
  const before = readme.slice(0, readme.indexOf('### Chainlink ACE licensing'));
  t.true(before.length > 0);
  t.is((before.match(/^```/gm) ?? []).length % 2, 0, 'an unclosed fence precedes the section');
});

test('ACE links and notices are pinned to the installed @chainlink/ace version', t => {
  const { version } = JSON.parse(readFileSync(require.resolve('@chainlink/ace/package.json'), 'utf8')) as {
    version: string;
  };
  for (const url of [ACE_LICENSE_URL, ACE_GRANTS_URL]) t.true(url.includes(`/v${version}/`), url);
  t.true(contracts.sources['@chainlink/ace/LICENSE'] === installedLegalText('LICENSE'));
  const pkg = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')) as {
    devDependencies: Record<string, string>;
  };
  t.is(pkg.devDependencies['@chainlink/ace'], version);
});
