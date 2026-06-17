import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTronGovernor } from './governor';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { GovernorOptions } from '@openzeppelin/wizard';
import { buildGeneric, printContract, tronPrintProfile, TRON_DEFAULT_BLOCK_TIME } from '@openzeppelin/wizard';
import { solidityGovernorSchema } from '@openzeppelin/wizard-common/schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof solidityGovernorSchema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerTronGovernor(new McpServer(testMcpInfo));
  t.context.schema = z.object(solidityGovernorSchema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<Omit<GovernorOptions, 'access'>> = params;
  t.pass();
}

const tronPrint = (opts: GovernorOptions) =>
  printContract(
    buildGeneric({ kind: 'Governor', ...opts, blockTime: opts.blockTime ?? TRON_DEFAULT_BLOCK_TIME }),
    tronPrintProfile,
  );

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'MyGovernor',
    delay: '1 day',
    period: '1 week',
  };
  await assertAPIEquivalence(t, params, tronPrint);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'MyGovernor',
    delay: '1 day',
    period: '1 week',
    votes: 'erc20votes',
    clockMode: 'blocknumber',
    timelock: 'openzeppelin',
    blockTime: 12,
    decimals: 18,
    proposalThreshold: '1',
    quorumMode: 'absolute',
    quorumPercent: 0,
    quorumAbsolute: '5',
    storage: true,
    settings: true,
    upgradeable: 'uups',
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, tronPrint);
});
