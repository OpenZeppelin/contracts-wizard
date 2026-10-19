import test from 'ava';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the component's request/dispatch/confirmation code, substituting only
// the network and Svelte scheduler. Do not mirror submitChat in this test.
function mountChat(result: string, appliedCode?: string) {
  const source = fs.readFileSync(`${__dirname}/Wiz.svelte`, 'utf8');
  const script = source.match(/<script lang="ts">([\s\S]*?)<\/script>/)![1];
  const compiled = ts.transpileModule(
    `${script}\nexport const chatTest = {
    submit: submitChat,
    messages: () => messages,
    initialize: () => { language = 'solidity'; currentOpts = { name: 'OldToken', symbol: 'OLD' }; currentCode = 'contract OldToken {}'; },
    apply: () => { currentOpts = { name: 'NewToken', symbol: 'NEW' }; currentCode = ${JSON.stringify(appliedCode ?? 'contract OldToken {}')}; },
    busy: () => inProgress,
  };`,
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
  ).outputText;
  const exports = {} as {
    chatTest: {
      submit(message: { role: 'user'; content: string }): void;
      messages(): { content: string }[];
      initialize(): void;
      apply(): void;
      busy(): boolean;
    };
  };
  let scheduled = false;
  vm.runInNewContext(compiled, {
    exports,
    process: { env: { API_HOST: 'http://test.invalid' } },
    fetch: async () => new Response(result),
    TextDecoder,
    console: { log: () => undefined },
    require: (name: string) => {
      if (name === 'nanoid') return { nanoid: () => 'test-chat' };
      if (name === 'svelte')
        return {
          createEventDispatcher: () => () => {
            scheduled = true;
          },
          tick: async () => {
            await Promise.resolve();
            if (scheduled) exports.chatTest.apply();
          },
        };
      throw new Error(`Unexpected import ${name}`);
    },
  });
  exports.chatTest.initialize();
  return exports.chatTest;
}

const tool = JSON.stringify({
  function_call: { name: 'ERC20', arguments: JSON.stringify({ name: 'NewToken', symbol: 'NEW' }) },
});
async function send(chat: ReturnType<typeof mountChat>) {
  chat.submit({ role: 'user', content: 'Rename the token to NewToken, symbol NEW.' });
  for (let i = 0; i < 30 && chat.busy(); i++) await new Promise(resolve => setImmediate(resolve));
  if (chat.busy()) throw new Error('Chat did not complete');
  return chat.messages()[0]!.content;
}

test('does not announce success when a tool leaves the generated contract unchanged', async t => {
  const message = await send(mountChat(tool));
  t.notRegex(message, /Updated Wizard/);
  t.regex(message, /no change/i);
});

test('waits for the applied contract before confirming the update', async t => {
  t.regex(await send(mountChat(tool, 'contract NewToken {}')), /Updated Wizard using ERC20/);
});

test('preserves an explanatory response without attempting a settings update', async t => {
  const response = 'Flash minting cannot be combined with ACE.';
  t.is(await send(mountChat(response)), response);
});

test('malformed function arguments never announce a successful update', async t => {
  const bad = JSON.stringify({ function_call: { name: 'ERC20', arguments: 'not-json' } });
  t.notRegex(await send(mountChat(bad)), /Updated Wizard/);
});
