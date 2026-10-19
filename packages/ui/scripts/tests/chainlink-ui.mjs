// Run against the built local UI with PLAYWRIGHT_MODULE pointing to an installed playwright package.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { URL, URLSearchParams } from 'node:url';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const moduleRequire = createRequire(import.meta.url);
const { chromium } = moduleRequire(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const base = process.env.WIZARD_UI_URL || 'http://127.0.0.1:5198';
const failures = [];
async function scenario(name, run) {
  if (process.env.UI_SCENARIO && !name.includes(process.env.UI_SCENARIO)) return;
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => console.error(`BROWSER ERROR ${name}: ${error.message}`));
  page.setDefaultNavigationTimeout(60000);
  await page.route('**/*', route =>
    new URL(route.request().url()).origin === base ? route.continue() : route.abort(),
  );
  try {
    await run(page);
    console.log(`PASS ${name}`);
  } catch (e) {
    failures.push(name);
    console.error(`FAIL ${name}: ${e.stack}`);
  } finally {
    await page.close();
  }
}
const controls = p => p.locator('.controls > div:not(.hidden)');
const section = (p, name) =>
  controls(p)
    .locator('section')
    .filter({ has: p.locator('h1').filter({ hasText: name }) });
const toggle = (p, name) => section(p, name).locator('h1 input[type=checkbox]');
const aceCheckbox = p =>
  section(p, 'Policy Engine').locator('label', { hasText: 'Chainlink ACE' }).locator('input[type=checkbox]');
const radio = (p, value) => controls(p).locator(`input[type=radio][value="${value}"]`);
const code = p => p.locator('code.hljs').innerText();
const errorTip = (p, pattern) => p.locator('.tippy-box[data-state="visible"]').filter({ hasText: pattern }).first();
async function open(p, kind = 'ERC20', lang = 'solidity') {
  await p.goto(`${base}/embed.html?tab=${kind}&lang=${lang}`, { waitUntil: 'domcontentloaded' });
  await p.locator('code.hljs').waitFor();
}
async function settle(p) {
  await p.waitForTimeout(100);
}
async function ai(p, kind, args) {
  await p.route('**/ai', route =>
    route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: JSON.stringify({ function_call: { name: kind, arguments: JSON.stringify(args) } }),
    }),
  );
  if (!(await p.getByPlaceholder('Ask me anything...').isVisible()))
    await p.getByRole('button', { name: 'AI Assistant', exact: true }).click();
  await p.getByPlaceholder('Ask me anything...').fill('Apply local deterministic test configuration');
  // Since the assistant stopped announcing success for updates that leave the
  // contract unchanged (OptionsError included), wait for whichever outcome
  // message the apply produces, counting past earlier chat messages.
  const confirmations = p.getByText(/Updated Wizard using|No change was applied|Error executing function/);
  const before = await confirmations.count();
  const response = p.waitForResponse(r => r.url().endsWith('/ai'));
  await p.getByPlaceholder('Ask me anything...').press('Enter');
  await response;
  while ((await confirmations.count()) <= before) await p.waitForTimeout(50);
  await settle(p);
}
for (const kind of ['ERC20', 'Stablecoin', 'RealWorldAsset']) {
  await scenario(`${kind} independent CCIP / ACE controls, keyboard, defaults, recovery`, async p => {
    await open(p, kind);
    const original = await code(p);
    assert.equal(await aceCheckbox(p).isChecked(), false);
    assert.equal(await toggle(p, 'Crosschain Bridging').isChecked(), false);
    await toggle(p, 'Crosschain Bridging').check();
    const order = await section(p, 'Crosschain Bridging')
      .locator('input[type=radio]')
      .evaluateAll(xs => xs.map(x => x.value));
    assert.deepEqual(order.slice(0, 2), ['custom', 'chainlink-ccip']);
    await radio(p, 'chainlink-ccip').check();
    await settle(p);
    assert.equal(await radio(p, 'ownable').isDisabled(), true);
    assert.equal(await radio(p, 'roles').isChecked(), true);
    await settle(p);
    assert.match(await code(p), /getCCIPAdmin/);
    assert.doesNotMatch(await code(p), /PolicyProtected/);
    await aceCheckbox(p).focus();
    await p.keyboard.press('Space');
    await settle(p);
    assert.equal(await aceCheckbox(p).isChecked(), true);
    assert.match(await code(p), /PolicyProtected/);
    assert.match(await code(p), /getCCIPAdmin/);
    // A Policy Engine section with the Chainlink ACE checkbox, no radios.
    assert.equal(await section(p, 'Policy Engine').locator('input[type=radio]').count(), 0);
    await toggle(p, 'Crosschain Bridging').uncheck();
    await settle(p);
    assert.equal(await radio(p, 'ownable').isEnabled(), true);
    assert.match(await code(p), /PolicyProtected/);
    assert.doesNotMatch(await code(p), /getCCIPAdmin/);
    await aceCheckbox(p).uncheck();
    await settle(p);
    assert.doesNotMatch(await code(p), /PolicyProtected|getCCIPAdmin/);
    assert.match(original, /contract /);
    await p.getByRole('button', { name: 'ERC721', exact: true }).click();
    await settle(p);
    assert.doesNotMatch(await code(p), /PolicyProtected|getCCIPAdmin/);
  });
  for (const initialAccess of ['ownable', 'managed']) {
    await scenario(`${kind} CCIP disables ${initialAccess} and preserves optional Burnable`, async p => {
      await open(p, kind);
      await toggle(p, 'Access Control').check();
      await radio(p, initialAccess).check();
      const burnable = controls(p).getByRole('checkbox', { name: /^Burnable/ });
      await burnable.check();
      await toggle(p, 'Crosschain Bridging').check();
      await radio(p, 'chainlink-ccip').check();
      await settle(p);
      assert.equal(await radio(p, 'ownable').isDisabled(), true);
      assert.equal(await radio(p, 'managed').isDisabled(), true);
      assert.equal(await radio(p, 'roles').isChecked(), true);
      assert.equal(await burnable.isChecked(), true);
      assert.equal(await burnable.isEnabled(), true);
      assert.match(await code(p), /getCCIPAdmin/);
      assert.match(await code(p), /ERC20Burnable/);
      assert.doesNotMatch(await code(p), /Ownable|AccessManaged|BURNER_ROLE/);
      await burnable.uncheck();
      await settle(p);
      assert.match(await code(p), /BURNER_ROLE/);
      assert.doesNotMatch(await code(p), /ERC20Burnable/);
      await radio(p, 'custom').check();
      await settle(p);
      assert.equal(await radio(p, 'ownable').isEnabled(), true);
      assert.equal(await radio(p, 'managed').isEnabled(), true);
      await radio(p, initialAccess).check();
      await settle(p);
      assert.match(await code(p), initialAccess === 'ownable' ? /Ownable/ : /AccessManaged/);
      await radio(p, 'chainlink-ccip').check();
      await settle(p);
      assert.equal(await radio(p, 'ownable').isDisabled(), true);
      assert.equal(await radio(p, 'managed').isDisabled(), true);
      assert.equal(await radio(p, 'roles').isChecked(), true);
      assert.match(await code(p), /getCCIPAdmin/);
      await toggle(p, 'Crosschain Bridging').uncheck();
      await settle(p);
      assert.equal(await radio(p, 'ownable').isEnabled(), true);
      assert.equal(await radio(p, 'managed').isEnabled(), true);
    });
  }
}
await scenario('Wiz consumer applies both fields and displays invalid core OptionsError', async p => {
  const requests = [];
  p.on('request', request => {
    if (request.url().endsWith('/ai')) requests.push(request.postDataJSON());
  });
  await open(p);
  await ai(p, 'ERC20', { crossChainBridging: 'chainlink-ccip', chainlinkAce: true, access: 'roles' });
  assert.match(await code(p), /PolicyProtected/);
  assert.match(await code(p), /getCCIPAdmin/);
  await ai(p, 'ERC20', { callback: true });
  assert.equal(requests[1].currentOpts.crossChainBridging, 'chainlink-ccip');
  assert.equal(requests[1].currentOpts.chainlinkAce, true);
  await errorTip(p, /Callback/).waitFor();
  assert.match(await code(p), /contract /, 'the last valid source stays visible on error');
  assert.equal(await p.getByRole('button', { name: 'Open in Remix', exact: true }).count(), 0);
  assert.equal(
    await controls(p)
      .getByRole('checkbox', { name: /^Callback/ })
      .isChecked(),
    true,
  );
  for (const [invalid, message] of [
    [{ flashmint: true }, /Flash Minting/i],
    [{ premint: '1' }, /premint/i],
    [{ crossChainBridging: 'custom' }, /CCIP/i],
  ]) {
    await ai(p, 'ERC20', {
      callback: false,
      flashmint: false,
      premint: '',
      access: 'roles',
      crossChainBridging: 'chainlink-ccip',
      chainlinkAce: true,
      ...invalid,
    });
    await errorTip(p, message).waitFor();
    assert.match(await code(p), /contract /);
  }
  for (const access of ['ownable', 'managed']) {
    // The UI normalizes unsupported access selections before rendering imported CCIP options.
    await ai(p, 'ERC20', {
      crossChainBridging: 'chainlink-ccip',
      chainlinkAce: true,
      access,
    });
    assert.equal(await radio(p, 'ownable').isDisabled(), true);
    assert.equal(await radio(p, 'managed').isDisabled(), true);
    assert.equal(await radio(p, 'roles').isChecked(), true);
    assert.match(await code(p), /getCCIPAdmin/);
    assert.doesNotMatch(await code(p), /Ownable|AccessManaged/);
  }
  await ai(p, 'ERC20', { callback: false, access: 'roles', crossChainBridging: false, chainlinkAce: false });
  assert.equal(
    await p
      .locator('.tippy-box[data-state="visible"]')
      .filter({ hasText: /Chainlink|premint|Managed/ })
      .count(),
    0,
  );
  assert.doesNotMatch(await code(p), /PolicyProtected|getCCIPAdmin/);
  await ai(p, 'ERC20', { name: 'MyToken' });
  assert.equal(requests.at(-1).currentOpts.crossChainBridging, false);
  assert.equal(requests.at(-1).currentOpts.chainlinkAce, false);
  for (const kind of ['Stablecoin', 'RealWorldAsset']) {
    await ai(p, kind, {
      crossChainBridging: 'chainlink-ccip',
      chainlinkAce: true,
      access: 'roles',
      upgradeable: 'uups',
    });
    // These kinds have no upgradeability control to carry the message (and no
    // Remix button at all); the visible signal is the disabled export actions
    // over the still-visible source.
    assert.ok((await p.locator('.action button.disabled').count()) > 0);
    assert.match(await code(p), /contract /);
    await ai(p, kind, { upgradeable: false });
    await p.locator('.action button.disabled').first().waitFor({ state: 'detached' });
    assert.match(await code(p), /PolicyProtected/);
    assert.match(await code(p), /getCCIPAdmin/);
  }
});
for (const lang of ['tron', 'polkadot']) {
  await scenario(`${lang} hides choices and rejects imported integration without losing intent`, async p => {
    await open(p, 'ERC20', lang);
    assert.equal(await controls(p).locator('input[value="chainlink-ccip"]').count(), 0);
    assert.equal(await section(p, 'Policy Engine').count(), 0);
    // Omitted features render nothing at all (no unavailability note).
    assert.doesNotMatch(await controls(p).innerText(), /Chainlink/);
    // CCIP alone: the sanitize error is keyed on Crosschain Bridging, which
    // this network still renders, so the message is visible on that control.
    await ai(p, 'ERC20', { crossChainBridging: 'chainlink-ccip' });
    await errorTip(p, /not supported/i).waitFor();
    assert.match(await code(p), /contract /);
    // ACE alone: the key has no control here; the visible signal is the
    // disabled exports over the still-visible last source.
    await ai(p, 'ERC20', { crossChainBridging: false, chainlinkAce: true });
    await settle(p);
    assert.equal(await p.getByRole('button', { name: 'Open in Remix', exact: true }).count(), 0);
    assert.match(await code(p), /contract /);
  });
}
await scenario('actual Download ZIP and Remix preserve displayed ACE plus CCIP token', async p => {
  await open(p);
  await ai(p, 'ERC20', { crossChainBridging: 'chainlink-ccip', chainlinkAce: true, access: 'roles' });
  const source = await code(p);
  assert.match(source, /PolicyProtected/);
  assert.match(source, /getCCIPAdmin/);
  const sourceHash = createHash('sha256').update(source).digest('hex');
  const output = process.env.UI_ARTIFACTS_DIR;
  if (output) await mkdir(output, { recursive: true });
  const { default: JSZip } = await import('jszip');
  const artifacts = [];
  for (const format of ['Hardhat', 'Foundry']) {
    await p.getByRole('button', { name: 'Download', exact: true }).click();
    const [result] = await Promise.all([
      p.waitForEvent('download', { timeout: 60000 }),
      p.getByRole('button', { name: new RegExp(`Development Package .*${format}`) }).click(),
    ]);
    assert.equal(await result.failure(), null);
    const data = await readFile(await result.path());
    const zip = await JSZip.loadAsync(data);
    const tokenPath = Object.keys(zip.files).find(name => name.endsWith('/MyToken.sol'));
    assert.ok(tokenPath, `${format} contains MyToken.sol`);
    const token = await zip.file(tokenPath).async('string');
    assert.equal(token, source, `${format} token must match displayed code byte for byte`);
    artifacts.push({
      format,
      tokenPath,
      tokenSha256: createHash('sha256').update(token).digest('hex'),
      zipSha256: createHash('sha256').update(data).digest('hex'),
    });
    if (output) await writeFile(path.join(output, `${format.toLowerCase()}-combined.zip`), data);
    await p.keyboard.press('Escape');
  }
  // The actual button computes the URL; intercept only the external browser boundary.
  await p.evaluate(() => {
    globalThis.open = url => {
      globalThis.__remixURL = String(url);
      return null;
    };
  });
  await p.getByRole('button', { name: 'Open in Remix', exact: true }).click();
  const url = await p.evaluate(() => globalThis.__remixURL);
  const hash = new URLSearchParams(new URL(url).hash.slice(1));
  const decode = encoded => Buffer.from(encoded, 'base64').toString('utf8');
  assert.equal(decode(hash.get('code')), source);
  const remappings = decode(hash.get('remaps'));
  assert.match(remappings, /^@chainlink\/ace\/=@chainlink\/ace@1\.2\.0\/$/m);
  if (output) {
    await writeFile(path.join(output, 'MyToken.sol'), source);
    await writeFile(
      path.join(output, 'manifest.json'),
      JSON.stringify(
        {
          sourceHash,
          artifacts,
          remappings,
          remixExternalCompilation: 'not exercised; URL source and remappings only',
        },
        null,
        2,
      ) + '\n',
    );
    await p.screenshot({ path: path.join(output, 'combined-ui.png'), fullPage: true });
  }
});
await browser.close();
assert.deepEqual(failures, [], 'browser scenarios failed');
