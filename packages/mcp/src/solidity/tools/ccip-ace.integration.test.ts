import test from 'ava';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { erc20, stablecoin, realWorldAsset, type ERC20Options } from '@openzeppelin/wizard';
import { registerSolidityERC20 } from './erc20';
import { registerSolidityStablecoin } from './stablecoin';
import { registerSolidityRWA } from './rwa';
import { registerTronTRC20 } from '../../tron/tools/erc20';

// Use the real SDK transport, registration, schema validation and handler dispatch.
// App HTML must be built with `yarn --cwd packages/mcp build:apps` before this suite.
async function connect() {
  const server = new McpServer({ name: 'ccip-ace-test', version: '1.0.0' });
  registerSolidityERC20(server);
  registerSolidityStablecoin(server);
  registerSolidityRWA(server);
  registerTronTRC20(server);
  const client = new Client({ name: 'ccip-ace-client', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  return {
    client,
    close: async () => {
      await client.close();
      await server.close();
    },
  };
}

const tools = [
  ['solidity-erc20', erc20.print],
  ['solidity-stablecoin', stablecoin.print],
  ['solidity-rwa', realWorldAsset.print],
] as const;
const modes = [
  ['default', {}],
  ['CCIP', { crossChainBridging: 'chainlink-ccip' }],
  ['ACE', { chainlinkAce: true }],
  ['CCIP + ACE', { crossChainBridging: 'chainlink-ccip', chainlinkAce: true }],
  ['CCIP + Burnable', { crossChainBridging: 'chainlink-ccip', burnable: true }],
  ['CCIP + ACE + Burnable', { crossChainBridging: 'chainlink-ccip', chainlinkAce: true, burnable: true }],
] as const;

test('MCP lists CCIP then ACE capabilities only on supported token tools', async t => {
  const { client, close } = await connect();
  try {
    const { tools: listed } = await client.listTools();
    for (const [name] of tools) {
      const tool = listed.find(tool => tool.name === name)!;
      const properties = tool.inputSchema.properties!;
      const bridge = JSON.stringify(properties.crossChainBridging);
      t.true(bridge.indexOf('custom') < bridge.indexOf('chainlink-ccip'));
      t.true(bridge.includes('chainlink-ccip'));
      t.true(JSON.stringify(properties.chainlinkAce).includes('boolean'));
      t.false(tool.inputSchema.required?.includes('chainlinkAce') ?? false);
    }
  } finally {
    await close();
  }
});

for (const [name, print] of tools) {
  for (const [mode, features] of modes) {
    test(`${name} real MCP ${mode} output equals public printer bytes`, async t => {
      const { client, close } = await connect();
      try {
        const opts = { name: 'MyToken', symbol: 'MTK', ...features };
        const result = (await client.callTool({ name, arguments: opts })) as CallToolResult;
        t.falsy(result.isError);
        t.is(result.structuredContent?.code, print(opts as ERC20Options));
        const received = result.structuredContent?.opts as Record<string, unknown>;
        for (const [key, value] of Object.entries(features)) t.is(received[key], value);
        if (mode.includes('ACE')) t.regex(String(result.structuredContent?.code), /PolicyEngine/);
        if (mode.includes('CCIP')) t.regex(String(result.structuredContent?.code), /MINTER_ROLE/);
      } finally {
        await close();
      }
    });
  }
  for (const features of [
    { chainlinkAce: true, access: 'managed' },
    { chainlinkAce: true, callback: true },
    { chainlinkAce: true, flashmint: true },
    { chainlinkAce: true, premint: '1' },
    { chainlinkAce: true, crossChainBridging: 'custom' },
    { chainlinkAce: true, crossChainBridging: 'erc7786native' },
    { chainlinkAce: true, crossChainBridging: 'superchain' },
    { crossChainBridging: 'chainlink-ccip', access: 'ownable' },
    { crossChainBridging: 'chainlink-ccip', access: 'managed' },
    { chainlinkAce: 'unknown' },
    { crossChainBridging: 'unknown' },
  ]) {
    test(`${name} real MCP rejects ${JSON.stringify(features)}`, async t => {
      const { client, close } = await connect();
      try {
        const result = (await client.callTool({
          name,
          arguments: { name: 'MyToken', symbol: 'MTK', ...features },
        })) as CallToolResult;
        t.true(result.isError);
      } finally {
        await close();
      }
    });
  }
  for (const upgradeable of ['uups', 'transparent']) {
    for (const [, features] of modes.slice(1)) {
      test(`${name} real MCP ${name === 'solidity-erc20' ? 'supports' : 'rejects'} ${JSON.stringify(features)} with ${upgradeable}`, async t => {
        const { client, close } = await connect();
        try {
          const result = (await client.callTool({
            name,
            arguments: { name: 'MyToken', symbol: 'MTK', ...features, upgradeable },
          })) as CallToolResult;
          if (name === 'solidity-erc20') {
            t.falsy(result.isError);
            t.is(
              result.structuredContent?.code,
              erc20.print({ name: 'MyToken', symbol: 'MTK', ...features, upgradeable } as ERC20Options),
            );
          } else {
            t.true(result.isError);
          }
        } finally {
          await close();
        }
      });
    }
  }
}

test('TRON real MCP refuses inherited ACE and CCIP options', async t => {
  const { client, close } = await connect();
  try {
    const tool = (await client.listTools()).tools.find(tool => tool.name === 'tron-trc20')!;
    const properties = tool.inputSchema.properties!;
    t.false(JSON.stringify(properties.crossChainBridging).includes('"ccip"'));
    t.false(JSON.stringify(properties.chainlinkAce ?? {}).includes('true'));
    for (const features of [{ crossChainBridging: 'chainlink-ccip' }, { chainlinkAce: true }]) {
      const result = (await client.callTool({
        name: 'tron-trc20',
        arguments: { name: 'MyToken', symbol: 'MTK', ...features },
      })) as CallToolResult;
      t.true(result.isError);
    }
  } finally {
    await close();
  }
});

const ACE_NOTICE = [
  '// Imports Chainlink ACE components licensed under BUSL-1.1.',
  '// License: https://github.com/smartcontractkit/chainlink-ace/blob/v1.2.0/LICENSE',
].join('\n');

test('MCP tool descriptions explain the effective ACE license only where ACE is offered', async t => {
  const { client, close } = await connect();
  try {
    const { tools: listed } = await client.listTools();
    for (const [name] of tools) {
      const properties = listed.find(tool => tool.name === name)!.inputSchema.properties as Record<
        string,
        { description: string; properties: { license: { description: string } } }
      >;
      t.regex(properties.chainlinkAce!.description, /BUSL-1\.1, overriding info\.license/);
      t.true(properties.chainlinkAce!.description.includes('chainlink-ace-License-grants'));
      t.regex(properties.info!.properties.license.description, /chainlinkAce.*BUSL-1\.1/);
    }
    const tron = listed.find(tool => tool.name === 'tron-trc20')!;
    t.false(JSON.stringify(tron.inputSchema).includes('BUSL'));
  } finally {
    await close();
  }
});

for (const [name, print] of tools) {
  for (const [mode, features] of [
    ['ACE', { chainlinkAce: true }],
    ['CCIP + ACE', { crossChainBridging: 'chainlink-ccip', chainlinkAce: true }],
  ] as const) {
    for (const license of [undefined, 'MIT', 'Apache-2.0']) {
      test(`${name} real MCP ${mode} license ${license ?? 'default'} returns BUSL-1.1`, async t => {
        const { client, close } = await connect();
        try {
          const opts = { name: 'MyToken', symbol: 'MTK', ...features, ...(license ? { info: { license } } : {}) };
          const result = (await client.callTool({ name, arguments: opts })) as CallToolResult;
          t.falsy(result.isError);
          const code = String(result.structuredContent?.code);
          t.true(code.startsWith('// SPDX-License-Identifier: BUSL-1.1\n'));
          t.true(code.includes(ACE_NOTICE));
          t.is(code, print(opts as ERC20Options));
        } finally {
          await close();
        }
      });
    }
  }
  for (const [mode, features] of [
    ['default', {}],
    ['CCIP', { crossChainBridging: 'chainlink-ccip' }],
  ] as const) {
    for (const license of [undefined, 'Apache-2.0']) {
      test(`${name} real MCP ${mode} license ${license ?? 'default'} keeps its license`, async t => {
        const { client, close } = await connect();
        try {
          const opts = { name: 'MyToken', symbol: 'MTK', ...features, ...(license ? { info: { license } } : {}) };
          const result = (await client.callTool({ name, arguments: opts })) as CallToolResult;
          const code = String(result.structuredContent?.code);
          t.true(code.startsWith(`// SPDX-License-Identifier: ${license ?? 'MIT'}\n`));
          t.false(code.includes('Chainlink ACE'));
        } finally {
          await close();
        }
      });
    }
  }
}
