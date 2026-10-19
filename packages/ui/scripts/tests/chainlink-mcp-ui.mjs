// Tests the packaged MCP HTML and real SDK transport with a local deterministic host.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { URL } from 'node:url';
const moduleRequire = createRequire(import.meta.url);
const { chromium } = moduleRequire(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const failures = [];
for (const lang of ['solidity', 'tron']) {
  if (process.env.UI_MCP_LANGUAGE && process.env.UI_MCP_LANGUAGE !== lang) continue;
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(60000);
  page.on('pageerror', e => console.error(`BROWSER ERROR ${lang}: ${e.stack}`));
  try {
    const html = (await readFile(new URL(`../../../mcp/apps/${lang}.html`, import.meta.url), 'utf8')).replace(
      '__OZ_MCP_KIND__',
      'ERC20',
    );
    const opts =
      lang === 'solidity'
        ? { name: 'Token', symbol: 'TKN', crossChainBridging: 'chainlink-ccip', chainlinkAce: true, access: 'roles' }
        : { name: 'Token', symbol: 'TKN' };
    await page.route('**/*', route => {
      const pathname = new URL(route.request().url()).pathname;
      if (pathname === '/app') return route.fulfill({ contentType: 'text/html', body: html });
      if (pathname === '/host')
        return route.fulfill({
          contentType: 'text/html',
          body: `<!DOCTYPE html><script>
        globalThis.sent = [];
        addEventListener('message', event => {
          const request = event.data;
          if (request.method === 'ui/initialize') event.source.postMessage({ jsonrpc: '2.0', id: request.id, result: {
            protocolVersion: '2026-01-26', hostInfo: { name: 'Local regression host', version: '1' },
            hostCapabilities: { message: { text: {} } }, hostContext: {}
          } }, '*');
          if (request.method === 'ui/notifications/initialized') event.source.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-input', params: { arguments: ${JSON.stringify(opts)} } }, '*');
          if (request.method === 'ui/message') {
            globalThis.sent.push(request.params);
            event.source.postMessage({ jsonrpc: '2.0', id: request.id, result: {} }, '*');
          }
        });
        </script><iframe src="/app" style="width:1100px;height:650px"></iframe>`,
        });
      return route.abort();
    });
    await page.goto('http://mcp.local/host', { waitUntil: 'domcontentloaded' });
    const frame = page.frameLocator('iframe');
    const send = frame.getByRole('button', { name: 'Send Updates to Agent', exact: true });
    await send.waitFor({ timeout: 60000 });
    await page.waitForTimeout(150);
    assert.equal(await send.isEnabled(), true);
    const source = await frame.locator('code.hljs').innerText();
    if (lang === 'solidity') {
      assert.match(source, /PolicyProtected/);
      assert.match(source, /getCCIPAdmin/);
      assert.equal(await frame.getByRole('radio', { name: /^Ownable/ }).isDisabled(), true);
      assert.equal(await frame.getByRole('radio', { name: /^Managed/ }).isDisabled(), true);
      assert.equal(await frame.getByRole('radio', { name: /^Roles/ }).isChecked(), true);
      const bridging = frame.getByRole('checkbox', { name: /Crosschain Bridging/ });
      await bridging.press('Space');
      assert.equal(await frame.getByRole('radio', { name: /^Ownable/ }).isEnabled(), true);
      await frame.getByRole('radio', { name: /^Ownable/ }).check();
      await bridging.press('Space');
      await frame.getByRole('radio', { name: /^Chainlink CCIP/ }).check();
      await page.waitForTimeout(150);
      assert.equal(await frame.getByRole('radio', { name: /^Ownable/ }).isDisabled(), true);
      assert.equal(await frame.getByRole('radio', { name: /^Managed/ }).isDisabled(), true);
      assert.equal(await frame.getByRole('radio', { name: /^Roles/ }).isChecked(), true);
      assert.equal(await frame.locator('code.hljs').innerText(), source);
      await frame.getByRole('checkbox', { name: /^Callback/ }).check();
    } else {
      await frame.getByRole('textbox', { name: 'Decimals', exact: false }).fill('invalid');
    }
    assert.match(await frame.getByRole('alert').innerText(), lang === 'solidity' ? /callback/i : /valid number/i);
    assert.equal(await frame.locator('code.hljs').innerText(), source, 'last valid source stays visible on error');
    assert.equal(await send.isDisabled(), true);
    if (process.env.UI_ARTIFACTS_DIR) {
      await mkdir(process.env.UI_ARTIFACTS_DIR, { recursive: true });
      await page.screenshot({ path: path.join(process.env.UI_ARTIFACTS_DIR, `mcp-${lang}-invalid.png`) });
    }
    assert.deepEqual(await page.evaluate(() => globalThis.sent), []);
    if (lang === 'solidity') await frame.getByRole('checkbox', { name: /^Callback/ }).uncheck();
    else await frame.getByRole('textbox', { name: 'Decimals', exact: false }).fill('18');
    await page.waitForTimeout(150);
    assert.equal(await frame.getByRole('alert').count(), 0);
    assert.equal(await frame.locator('code.hljs').innerText(), source);
    assert.equal(await send.isEnabled(), true);
    await send.click();
    await page.waitForFunction(() => globalThis.sent.length === 1);
    assert.ok((await page.evaluate(() => globalThis.sent[0].content[0].text)).includes(source.trimEnd()));
    assert.equal(
      await frame.locator('.controls a[target="_blank"]').count(),
      0,
      'controls respect a host without openLinks',
    );
    console.log(
      `PASS ${lang} packaged MCP App invalid -> visible error / disabled Send -> recovery / exact source Send`,
    );
  } catch (e) {
    failures.push(lang);
    console.error(`FAIL ${lang}: ${e.message}`);
  } finally {
    await page.close();
  }
}
await browser.close();
assert.deepEqual(failures, []);
