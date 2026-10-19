import handler from '../../ai.ts';
import type { SimpleAiFunctionDefinition } from '../types/function-definition.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function accepts(schema: unknown, value: unknown): boolean {
  const property = schema as { anyOf?: unknown[]; enum?: unknown[]; type?: string } | undefined;
  if (!property) return false;
  if (property.anyOf) return property.anyOf.some(option => accepts(option, value));
  if (property.enum) return property.enum.includes(value);
  return typeof value === property.type;
}

// The API advertises functions and relays streamed arguments. It does not run a
// printer or validate model output; the Wizard consumer/core handles that step.
// Stub the external HTTP boundary only: real handler, SDK, SSE processing, and
// definitions execute. No real API key, model call, Redis service or network I/O.
Deno.test('AI endpoint advertises and relays CCIP / ACE with the real function definitions', async t => {
  const originalFetch = globalThis.fetch;
  const envNames = ['OPENAI_API_KEY', 'OPENAI_MODEL', 'ENV'];
  const savedEnv = new Map(envNames.map(name => [name, Deno.env.get(name)]));
  Deno.env.set('OPENAI_API_KEY', 'test-only-not-a-credential');
  Deno.env.set('OPENAI_MODEL', 'test-only-model');
  Deno.env.set('ENV', 'dev');
  let selectedName = 'ERC20';
  let selectedOptions: Record<string, unknown> = {};
  let capturedTools: { type: string; function: SimpleAiFunctionDefinition }[] = [];
  let calls = 0;
  let capturedMessages: { role: string; content: string }[] = [];
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    assert(request.url === 'https://api.openai.com/v1/chat/completions', `Unexpected HTTP request: ${request.url}`);
    const body = await request.json();
    capturedTools = body.tools;
    capturedMessages = body.messages;
    calls++;
    const chunk = (delta: unknown, finish_reason: string | null) => ({
      id: 'test-completion',
      object: 'chat.completion.chunk',
      created: 0,
      model: 'test-only-model',
      choices: [{ index: 0, delta, finish_reason }],
    });
    const data =
      [
        chunk(
          {
            role: 'assistant',
            tool_calls: [
              {
                index: 0,
                id: 'test-call',
                type: 'function',
                function: {
                  name: selectedName,
                  arguments: JSON.stringify(selectedOptions),
                },
              },
            ],
          },
          null,
        ),
        chunk({}, 'tool_calls'),
      ]
        .map(value => `data: ${JSON.stringify(value)}\n\n`)
        .join('') + 'data: [DONE]\n\n';
    return new Response(data, { headers: { 'content-type': 'text/event-stream' } });
  };
  async function request(language = 'solidity') {
    const before = calls;
    const response = await handler(
      new Request('http://localhost/api/ai', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          language,
          messages: [
            { role: 'assistant', content: 'The token is named OldToken.' },
            { role: 'user', content: 'Generate this token' },
          ],
          currentCode: '',
          currentOpts: { kind: 'ERC20', name: 'ActualToken', symbol: 'ACT' },
          chatId: 'ccip-ace-test',
        }),
      }),
    );
    assert(response.status === 200, 'Expected successful endpoint response');
    const result = JSON.parse(await response.text());
    assert(calls === before + 1, 'Expected exactly one intercepted provider call');
    assert(result.function_call.name === selectedName, 'Function name was lost in the stream');
    assert(result.function_call.arguments === JSON.stringify(selectedOptions), 'Arguments changed in the stream');
    return capturedTools.map(tool => tool.function);
  }
  try {
    for (const name of ['ERC20', 'Stablecoin', 'RealWorldAsset']) {
      for (const mode of [
        { crossChainBridging: 'chainlink-ccip' },
        { chainlinkAce: true },
        { crossChainBridging: 'chainlink-ccip', chainlinkAce: true },
      ]) {
        await t.step(`${name} ${JSON.stringify(mode)}`, async () => {
          selectedName = name;
          selectedOptions = { name: 'MyToken', symbol: 'MTK', ...mode };
          const tools = await request();
          const definition = tools.find(tool => tool.name === name)!;
          const properties = definition.parameters.properties;
          // Before the ERC20-only prompt checks, so these run for every token kind.
          const aceDescription = (properties.chainlinkAce as { description: string }).description;
          assert(/BUSL-1\.1, overriding info\.license/.test(aceDescription), `${name} ACE must explain BUSL-1.1`);
          assert(aceDescription.includes('chainlink-ace-License-grants'), `${name} ACE must link the grants`);
          const licenseDescription = (properties.info as { properties: { license: { description: string } } })
            .properties.license.description;
          assert(/chainlinkAce.*BUSL-1\.1/.test(licenseDescription), `${name} license must explain the ACE override`);
          if (name === 'ERC20') {
            assert(accepts(properties.upgradeable, 'uups'), 'ERC20 must advertise UUPS');
            assert(accepts(properties.upgradeable, 'transparent'), 'ERC20 must advertise transparent');
            assert(
              /ERC20[^.]*transparent[^.]*UUPS/i.test(definition.description),
              'ERC20 context must explicitly support transparent and UUPS with CCIP/ACE',
            );
          }

          assert(accepts(properties.crossChainBridging, 'chainlink-ccip'), `${name} must advertise CCIP`);
          assert(accepts(properties.chainlinkAce, true), `${name} must advertise ACE`);
          assert(accepts(properties.chainlinkAce, false), 'ACE must allow disabled');
          assert(!definition.parameters.required?.includes('chainlinkAce'), 'ACE must stay optional');
          assert(!accepts(properties.chainlinkAce, 'ace'), 'String ACE values must not be advertised');
          assert(!accepts(properties.chainlinkAce, 'unknown'), 'Unknown chainlinkAce must not be advertised');
          assert(!accepts(properties.crossChainBridging, 'unknown'), 'Unknown bridge must not be advertised');
          if (name !== 'ERC20') {
            for (const proxy of ['transparent', 'uups']) {
              assert(!accepts(properties.upgradeable, proxy), `${name} must not advertise ${proxy}`);
            }
          }
        });
      }
    }
    await t.step('the current state follows conversation claims as an authoritative reminder', async () => {
      await request();
      const reminder = capturedMessages.at(-1)!;
      assert(reminder.role === 'system', 'Actual state must follow history, not be inferred from past success claims');
      assert(reminder.content.includes('ActualToken'), 'Reminder must contain the actual current options');
      assert(reminder.content.includes('UUPS'), 'Current ERC20 capabilities must accompany its state');
    });
    await t.step('defaults stay opt-in and NFT definitions do not gain fungible integrations', async () => {
      selectedName = 'ERC20';
      selectedOptions = { name: 'MyToken', symbol: 'MTK' };
      for (const definition of await request()) {
        if (['ERC721', 'ERC1155'].includes(definition.name)) {
          assert(
            !accepts(definition.parameters.properties.crossChainBridging, 'chainlink-ccip'),
            'NFT must not advertise CCIP',
          );
          assert(!accepts(definition.parameters.properties.chainlinkAce, true), 'NFT must not advertise ACE');
        }
      }
    });
    for (const language of ['tron', 'polkadot']) {
      await t.step(`${language} does not inherit unsupported integrations`, async () => {
        for (const definition of await request(language)) {
          assert(
            !accepts(definition.parameters.properties.crossChainBridging, 'chainlink-ccip'),
            `${language} must not advertise CCIP`,
          );
          assert(!accepts(definition.parameters.properties.chainlinkAce, true), `${language} must not advertise ACE`);
          assert(
            !definition.description.includes('Chainlink'),
            `${language} prompt must not suggest unsupported integrations`,
          );
          assert(!JSON.stringify(definition).includes('BUSL'), `${language} must not describe the ACE license`);
        }
      });
    }
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of savedEnv) {
      if (value === undefined) Deno.env.delete(name);
      else Deno.env.set(name, value);
    }
  }
});
