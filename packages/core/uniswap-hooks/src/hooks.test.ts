import test from 'ava';
import { hooks } from './api';
import { buildHooks, type HooksOptions } from './hooks';
import { HOOKS } from './hooks/';
import { printContract } from './print';
import { generateAllPermissions, generateMixedInversedPermissions, generateMixedPermissions } from './generate/hooks';

function testHooks(title: string, opts: Partial<HooksOptions>) {
  test(title, t => {
    const c = buildHooks({
      ...hooks.defaults,
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

for (const key in HOOKS) {
  const hook = HOOKS[key as keyof typeof HOOKS];
  testHooks(`basic ${hook.name}`, { hook: hook.name });

  testHooks(`mixed permissions ${hook.name}`, { hook: hook.name, permissions: generateMixedPermissions() });

  testHooks(`inversed mixed permissions ${hook.name}`, {
    hook: hook.name,
    permissions: generateMixedInversedPermissions(),
  });

  testHooks(`all permissions ${hook.name}`, { hook: hook.name, permissions: generateAllPermissions() });

  testHooks(`currency settler ${hook.name}`, { hook: hook.name, currencySettler: true });

  testHooks(`safeCast ${hook.name}`, { hook: hook.name, safeCast: true });

  testHooks(`transient storage ${hook.name}`, { hook: hook.name, transientStorage: true });

  testHooks(`access control (ownable) ${hook.name}`, { hook: hook.name, access: 'ownable' });

  testHooks(`access control (roles) ${hook.name}`, { hook: hook.name, access: 'roles' });

  testHooks(`access control (managed) ${hook.name}`, { hook: hook.name, access: 'managed' });

  testHooks(`pausable ${hook.name}`, { hook: hook.name, pausable: true });

  testHooks(`shares erc20 ${hook.name}`, {
    hook: hook.name,
    shares: { options: 'ERC20', name: 'MyShares', symbol: 'MSH' },
  });

  testHooks(`shares erc1155 ${hook.name}`, {
    hook: hook.name,
    shares: { options: 'ERC1155', uri: 'https://example.com/metadata/{id}.json' },
  });

  testHooks(`shares erc6909 ${hook.name}`, {
    hook: hook.name,
    shares: { options: 'ERC6909' },
  });
}
