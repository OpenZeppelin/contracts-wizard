import { promises as fs } from 'fs';
import _test, { TestFn, ExecutionContext } from 'ava';
import hre from 'hardhat';
import path from 'path';

import { generateSources, writeGeneratedSources } from './generate/sources';
import type { GenericOptions, KindedOptions } from './build-generic';
import { custom, erc1155, erc20, erc721, governor } from './api';

interface Context {
  generatedSourcesPath: string
}

const test = _test as TestFn<Context>;

test.serial('erc20 result compiles', async t => {
  await testCompile(t, 'ERC20');
});

test.serial('erc721 result compiles', async t => {
  await testCompile(t, 'ERC721');
});

test.serial('erc1155 result compiles', async t => {
  await testCompile(t, 'ERC1155');
});

test.serial('governor result compiles', async t => {
  await testCompile(t, 'Governor');
});

test.serial('custom result compiles', async t => {
  await testCompile(t, 'Custom');
});

async function testCompile(t: ExecutionContext<Context>, kind: keyof KindedOptions) {
  const generatedSourcesPath = path.join(hre.config.paths.sources, `generated`);
  await fs.rm(generatedSourcesPath, { force: true, recursive: true });
  await writeGeneratedSources(generatedSourcesPath, 'all', kind);

  // We only want to check that contracts compile and we don't care about any
  // of the outputs. Setting empty outputSelection causes compilation to go a
  // lot faster and not run out of memory.
  for (const { settings } of hre.config.solidity.compilers) {
    settings.outputSelection = {};
  }

  await hre.run('compile');
  t.pass();
}

function isAccessControlRequired(opts: GenericOptions) {
  switch(opts.kind) {
    case 'ERC20':
      return erc20.isAccessControlRequired(opts);
    case 'ERC721':
      return erc721.isAccessControlRequired(opts);
    case 'ERC1155':
      return erc1155.isAccessControlRequired(opts);
    case 'Governor':
      return governor.isAccessControlRequired(opts);
    case 'Custom':
      return custom.isAccessControlRequired(opts);
    default:
      throw new Error("No such kind");
  }
}

test('is access control required', async t => {
  for (const contract of generateSources('all')) {
    const regexOwnable = /import.*Ownable(Upgradeable)?.sol.*/gm;

    if (!contract.options.access) {
      if (isAccessControlRequired(contract.options)) {
        t.regex(contract.source, regexOwnable, JSON.stringify(contract.options));
      } else {
        t.notRegex(contract.source, regexOwnable, JSON.stringify(contract.options));
      }
    }
  }
});