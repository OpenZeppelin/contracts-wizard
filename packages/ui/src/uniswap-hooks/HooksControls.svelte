<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import { hooks } from '@openzeppelin/wizard-uniswap-hooks/';
  import { HOOKS } from '@openzeppelin/wizard-uniswap-hooks/src/hooks/index';
  import type { HookCategory, Hook, HookName, KindedOptions } from '@openzeppelin/wizard-uniswap-hooks';

  import AccessControlSection from './AccessControlSection.svelte';
  import InfoSection from './InfoSection.svelte';
  import ExpandableSection from '../common/ExpandableSection.svelte';
  import SharesControlsSection from './SharesControlsSection.svelte';

  import { 
    areSharesRequired,
    permissionRequiredByHook, 
    permissionRequiredByPausable, 
    permissionRequiredByAnotherPermission, 
    returnDeltaPermissionExtension,
  } from '@openzeppelin/wizard-uniswap-hooks/src/hooks';
  import { PERMISSIONS } from '@openzeppelin/wizard-uniswap-hooks/src/hooks/index';

  export let opts: Required<KindedOptions['Hooks']> = {
    kind: 'Hooks',
    ...hooks.defaults,
  };

  $: requireAccessControl = hooks.isAccessControlRequired(opts);

  let lastHook: HookName | undefined = undefined;
  $: if (opts.hook !== lastHook) {
    opts = {
      ...opts,
      ...hooks.defaults,
      hook: opts.hook,
      permissions: { ...hooks.defaults.permissions },
      shares: { ...hooks.defaults.shares },
    };
    lastHook = opts.hook;
  }

  // Keep a stable order and titles
  const CATEGORY_ORDER: HookCategory[] = ['Base', 'Fee', 'General'];
  const hooksByCategory: Record<HookCategory, Hook[]> = { Base: [], Fee: [], General: [] };
  for (const key in HOOKS) {
    const hook = HOOKS[key as HookName];
    hooksByCategory[hook.category].push(hook);
  }

  // function normalizeHookName(name: string): string {
  //   if (name === 'BaseHook') return name;
  //   return name.replace('Hook', '').replace('Base', '');
  // }

  function shortcutPermissionName(name: string): string {
    if (name.length > 25) return name.replace('Return', '');
    return name;
  }

  let showAdvancedPermissions = false;
  let showUtilities = false;
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
          {hook.displayName}
          <HelpTooltip link={hook.tooltipLink}>
            {@html hook.tooltipText}
          </HelpTooltip>
        </label>
      {/each}
    </div>
  </section>
{/each}

<ExpandableSection
  label="Additional Hook Permissions"
  bind:checked={showAdvancedPermissions}
  helpContent="Fine-tune which core hook function permissions are enabled."
  helpLink="https://docs.uniswap.org/contracts/v4/concepts/hooks#core-hook-functions"
>
  <div class="checkbox-group">
    {#each PERMISSIONS as permission}
      <label class:checked={opts.permissions[permission]}>
        <input
          type="checkbox"
          bind:checked={opts.permissions[permission]}
          disabled={
            permissionRequiredByHook(opts.hook, permission) ||
            permissionRequiredByPausable(opts, permission) ||
            permissionRequiredByAnotherPermission(opts, permission)
          }
        />
        {shortcutPermissionName(permission)}
        <HelpTooltip link="https://docs.uniswap.org/contracts/v4/concepts/hooks#core-hook-functions">
          {#if permissionRequiredByHook(opts.hook, permission)}
            The <code>{permission}</code> permission is required by <code>{opts.hook}</code>.
          {:else if permissionRequiredByPausable(opts, permission)}
            The <code>{permission}</code> permission is required when <code>Pausable</code> is enabled.
          {:else if permissionRequiredByAnotherPermission(opts, permission)}
            The <code>{permission}</code> permission is required when the <code>{returnDeltaPermissionExtension(permission)}</code> permission is enabled.
          {:else}
            Optionally enable the <code>{permission}</code> permission.
          {/if}
        </HelpTooltip>
      </label>
    {/each}
  </div>
</ExpandableSection>

<ExpandableSection
  label="Utilities"
  bind:checked={showUtilities}
  helpContent="Utilities are optional libraries that can used to enhance the functionality or security of the hook."
>
  <div class="checkbox-group">
    <label class:checked={opts.currencySettler}>
      <input type="checkbox" bind:checked={opts.currencySettler} />
      CurrencySettler
      <HelpTooltip link="https://docs.openzeppelin.com/uniswap-hooks/api/utils#CurrencySettler">
        Utility library used to settle and take any pending deltas with an unlocked `PoolManager` during flash accounting.
      </HelpTooltip>
    </label>

    <label class:checked={opts.safeCast}>
      <input type="checkbox" bind:checked={opts.safeCast} />
      SafeCast
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#SafeCast">
        Utility library to safely cast between numeric types, i.e. casting an uint256 fee to an uint128 BalanceDelta.
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
</ExpandableSection>  

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

  <div class="shares-section">
    <SharesControlsSection bind:opts 
    disabled={areSharesRequired(opts)} 
    helpContent={areSharesRequired(opts) ? `Shares are required by <code>${opts.hook}</code>` : undefined} />
  </div>
</section>

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<InfoSection bind:info={opts.info} />

<style>
  /* Target the controls-section inside this specific component */

  .shares-section {
    margin-left: 0.5rem;
  }

  .shares-section :global(.controls-section h1) {
    color: var(--text-color);
    font-size: var(--size-4);
    font-weight: 400;
    text-transform: none;
    font-variant: none;
  }
</style>