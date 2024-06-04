import { promises as fs } from 'fs';
import _test, { TestFn, ExecutionContext } from 'ava';
import path from 'path';

import { generateSources, writeGeneratedSources } from './generate/sources';
import type { GenericOptions, KindedOptions } from './build-generic';
import { custom, erc20, erc721, erc1155 } from './api';


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

test.serial('custom result compiles', async t => {
  await testCompile(t, 'Custom');
});

async function testCompile(t: ExecutionContext<Context>, kind: keyof KindedOptions) {
  // TODO define output path for compilation environment
  const generatedSourcesPath = path.join('artifacts/contracts', `generated`);
  await fs.rm(generatedSourcesPath, { force: true, recursive: true });
  await writeGeneratedSources(generatedSourcesPath, 'all', kind);

  // TODO compile the generated sources here, and ensure the compilation is successful

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
    case 'Custom':
      return custom.isAccessControlRequired(opts);
    default:
      throw new Error("No such kind");
  }
}

test('is access control required', async t => {
  for (const contract of generateSources('all')) {
    const regexOwnable = /(use openzeppelin::access::ownable::OwnableComponent)/gm;

    if (!contract.options.access) {
      if (isAccessControlRequired(contract.options)) {
        t.regex(contract.source, regexOwnable, JSON.stringify(contract.options));
      } else {
        t.notRegex(contract.source, regexOwnable, JSON.stringify(contract.options));
      }
    }
  }
});