<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import { infoDefaults } from '@openzeppelin/wizard';
  import { hooks, Hooks } from '@openzeppelin/wizard-uniswap-hooks';
  import type { HookCategory, Hook, HookName, KindedOptions } from '@openzeppelin/wizard-uniswap-hooks';

  import AccessControlSection from './AccessControlSection.svelte';
  import InfoSection from './InfoSection.svelte';
  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';

  import { 
    permissions, 
    PAUSABLE_PERMISSIONS, 
    permissionRequiredByHook, 
    permissionRequiredByPausable, 
    permissionRequiredByAnother, 
    returnDeltaPermissionExtension,
  } from '@openzeppelin/wizard-uniswap-hooks/src/hooks';

  export let opts: Required<KindedOptions['Hooks']> = {
    kind: 'Hooks',
    ...hooks.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  $: requireAccessControl = hooks.isAccessControlRequired(opts);

  // Keep a stable order and titles
  const CATEGORY_ORDER: HookCategory[] = ['Base', 'Fee', 'General'];
  const hooksByCategory: Record<HookCategory, Hook[]> = { Base: [], Fee: [], General: [] };
  for (const key in Hooks) {
    const hook = Hooks[key as keyof typeof Hooks];
    hooksByCategory[hook.category].push(hook);
  }

  // When the hook changes or pausable is disabled, reset the permissions to the default values
  let lastHook: HookName;
  let lastPausable: boolean = opts.pausable;
  $: {
    const hookChanged = opts.hook !== lastHook;
    const pausableTurnedOff = !opts.pausable && lastPausable;

    if (hookChanged || pausableTurnedOff) {
      opts = { ...opts, permissions: { ...Hooks[opts.hook].permissions } };
    }

    if (opts.pausable) {
      const updated: Partial<typeof opts.permissions> = {};
      for (const key of PAUSABLE_PERMISSIONS) {
        if (!opts.permissions[key]) updated[key] = true;
      }
      if (Object.keys(updated).length) {
        opts = { ...opts, permissions: { ...opts.permissions, ...updated } };
      }
    }

    lastHook = opts.hook;
    lastPausable = opts.pausable;
  }

  function normalizeHookName(name: string): string {
    if (name === 'BaseHook') return name;
    return name.replace('Hook', '').replace('Base', '');
  }

  function shortcutPermissionName(name: string): string {
    if (name.length > 25) return name.replace('Return', '');
    return name;
  }


</script>

<section class="controls-section">
  <h1>Settings</h1>

  <label class="labeled-input">
    <span>Name</span>
    <input bind:value={opts.name} />
  </label>
</section>

{#each CATEGORY_ORDER as category}
  <section class="controls-section">
    <h1>{category + ' Hooks'}</h1>
    <div class="checkbox-group">
      {#each hooksByCategory[category] as hook}
        <label class:checked={opts.hook === hook.name}>
          <input type="radio" bind:group={opts.hook} value={hook.name} />
          {normalizeHookName(hook.name)}
          <HelpTooltip link={hook.tooltipLink}>
            {@html hook.tooltipText}
          </HelpTooltip>
        </label>
      {/each}
    </div>
  </section>
{/each}

<section class="controls-section">
  <h1>Hook Permissions</h1>

  <div class="checkbox-group">
    {#each permissions as permission}
      <label class:checked={opts.permissions[permission]}>
        <input
          type="checkbox"
          bind:checked={opts.permissions[permission]}
          disabled={
            permissionRequiredByHook(opts.hook, permission) ||
            permissionRequiredByPausable(opts, permission) ||
            permissionRequiredByAnother(opts, permission)
          }
        />
        {shortcutPermissionName(permission)}
        <HelpTooltip link="https://docs.uniswap.org/contracts/v4/concepts/hooks#core-hook-functions">
          {#if permissionRequiredByHook(opts.hook, permission)}
            The <code>{permission}</code> permission is required by <code>{opts.hook}</code>.
          {:else if permissionRequiredByPausable(opts, permission)}
            The <code>{permission}</code> permission is required when <code>Pausable</code> is enabled.
          {:else if permissionRequiredByAnother(opts, permission)}
            The <code>{permission}</code> permission is required when the <code>{returnDeltaPermissionExtension(permission)}</code> permission is enabled.
          {:else}
            Optionally enable the <code>{permission}</code> permission.
          {/if}
        </HelpTooltip>
      </label>
    {/each}
  </div>
</section>

<section class="controls-section">
  <h1>Utilities</h1>

  <div class="checkbox-group">
    <label class:checked={opts.currencySettler}>
      <input type="checkbox" bind:checked={opts.currencySettler} />
      CurrencySettler
      <HelpTooltip link="https://docs.openzeppelin.com/uniswap-hooks/api/utils#CurrencySettler">
        Utility library used to settle and take any open deltas with an unlocked `PoolManager` during flash accounting.
      </HelpTooltip>
    </label>

    <label class:checked={opts.safeCast}>
      <input type="checkbox" bind:checked={opts.safeCast} />
      SafeCast
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#SafeCast">
        Utility library to safely cast between numeric types.
      </HelpTooltip>
    </label>

    <label class:checked={opts.transientStorage}>
      <input type="checkbox" bind:checked={opts.transientStorage} />
      Transient Storage
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#TransientSlot">
        Utility library for simplyfing the usage of Transient Storage, which is discarded after the transaction ends and
        whose gas costs are drastically reduced in comparison to regular storage.
      </HelpTooltip>
    </label>
  </div>
</section>

<ExpandableToggleRadio
  label="Shares"
  bind:value={opts.shares.options}
  defaultValue="ERC20"
  helpContent="Shares are useful to account for the ownership of a portion of a liquidity position or pending credit."
  helpLink="https://docs.openzeppelin.com/contracts/api/token/erc20"
>
  <div class="checkbox-group">
    <label class:checked={opts.shares.options === 'ERC20'}>
      <input type="radio" bind:group={opts.shares.options} value="ERC20" />
      ERC-20
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc20">
        ERC-20 shares are useful for single-token accounting.
      </HelpTooltip>
    </label>

    <label class:checked={opts.shares.options === 'ERC1155'}>
      <input type="radio" bind:group={opts.shares.options} value="ERC1155" />
      ERC-1155
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc1155">
        ERC-1155 shares are useful for multi-token accounting.
      </HelpTooltip>
    </label>

    <label class:checked={opts.shares.options === 'ERC6909'}>
      <input type="radio" bind:group={opts.shares.options} value="ERC6909" />
      ERC-6909
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc6909">
        ERC-6909 shares are useful for optimized multi-token accounting.
      </HelpTooltip>
    </label>
  </div>

  <div style="height: 0.5rem;"></div>

  {#if opts.shares.options === 'ERC1155'}
    <label class="labeled-input">
      <span>URI</span>
      <input bind:value={opts.shares.uri} />
    </label>
  {/if}

  {#if opts.shares.options === 'ERC20'}
    <div class="grid grid-cols-[2fr,1fr] gap-2">
      <label class="labeled-input">
        <span>Name</span>
        <input bind:value={opts.shares.name} />
      </label>

      <label class="labeled-input">
        <span>Symbol</span>
        <input bind:value={opts.shares.symbol} />
      </label>
    </div>
  {/if}
</ExpandableToggleRadio>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable} />
      Pausable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#Pausable">
        Privileged accounts will be able to pause the functionality marked as <code>whenNotPaused</code>. Useful for
        emergency response.
      </HelpTooltip>
    </label>
  </div>
</section>

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<InfoSection bind:info={opts.info} />
