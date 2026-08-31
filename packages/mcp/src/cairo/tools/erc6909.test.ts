import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoERC6909 } from './erc6909';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { ERC6909Options } from '@openzeppelin/wizard-cairo';
import { erc6909 } from '@openzeppelin/wizard-cairo';
import { cairoERC6909Schema } from '@openzeppelin/wizard-common/schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof cairoERC6909Schema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerCairoERC6909(new McpServer(testMcpInfo));
  t.context.schema = z.object(cairoERC6909Schema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<ERC6909Options> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'MyToken',
    access: {
      type: false,
      darInitialDelay: '0',
      darDefaultDelayIncrease: '0',
      darMaxTransferDelay: '0',
    },
  };
  await assertAPIEquivalence(t, params, erc6909.print);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'MyToken',
    burnable: true,
    pausable: true,
    mintable: true,
    contentUri: true,
    tokenSupply: true,
    metadata: true,
    access: {
      type: 'roles',
      darInitialDelay: '0',
      darDefaultDelayIncrease: '0',
      darMaxTransferDelay: '0',
    },
    upgradeable: true,
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
    macros: {
      withComponents: true,
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, erc6909.print);
});
