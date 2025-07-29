import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityERC7579 } from './erc7579';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { ERC7579Options } from '@openzeppelin/wizard';
import { erc7579 } from '@openzeppelin/wizard';
import { erc7579Schema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof erc7579Schema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerSolidityERC7579(new McpServer(testMcpInfo));
  t.context.schema = z.object(erc7579Schema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  // omit fields that are not included in the schema but are in ERC7579Options
  const _: DeepRequired<Omit<ERC7579Options, 'upgradeable'>> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'MyERC7579Module',
    validator: {
      signature: false,
      multisig: {
        weighted: false,
        confirmation: false,
      },
    },
    executor: {
      delayed: false,
    },
    hook: false,
    fallback: false,
  };
  await assertAPIEquivalence(t, params, erc7579.print);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'MyERC7579Module',
    validator: {
      signature: true,
      multisig: {
        weighted: true,
        confirmation: true,
      },
    },
    executor: {
      delayed: true,
    },
    hook: true,
    fallback: true,
    access: 'roles',
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };

  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, erc7579.print);
});
