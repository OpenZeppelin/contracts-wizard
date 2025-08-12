<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions } from '@openzeppelin/wizard-uniswap-hooks/src';
  import { infoDefaults } from '@openzeppelin/wizard';
  import { hooks, ALL_HOOKS } from '@openzeppelin/wizard-uniswap-hooks/src';

  import AccessControlSection from './AccessControlSection.svelte';
  import InfoSection from './InfoSection.svelte';
  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';

  export let opts: Required<KindedOptions['Hooks']> = {
    kind: 'Hooks',
    ...hooks.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  $: requireAccessControl = hooks.isAccessControlRequired(opts);
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <label class="labeled-input">
    <span>Name</span>
    <input bind:value={opts.name} />
  </label>
</section>

<section class="controls-section">
  <h1>Base Hooks</h1>

  <div class="checkbox-group">
    {#each ALL_HOOKS.slice(0, 4) as hookName}
        <label class:checked={opts.hook === hookName}>
          <input type="radio" bind:group={opts.hook} value={hookName} />
          {hookName}
          <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#Pausable">
            @TBD Privileged accounts will be able to pause the functionality marked as <code>whenNotPaused</code>. Useful for
            emergency response.
          </HelpTooltip>
        </label>
    {/each}
  </div>

</section>

<section class="controls-section">
  <h1>Fee Hooks</h1>

  <div class="checkbox-group">
    {#each ALL_HOOKS.slice(4, 8) as hookName}
        <label class:checked={opts.hook === hookName}>
          <input type="radio" bind:group={opts.hook} value={hookName} />
          {hookName}
          <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#Pausable">
            @TBD Privileged accounts will be able to pause the functionality marked as <code>whenNotPaused</code>. Useful for
            emergency response.
          </HelpTooltip>
        </label>
    {/each}
  </div>

</section>

<section class="controls-section">
  <h1>General Hooks</h1>

  <div class="checkbox-group">
    {#each ALL_HOOKS.slice(8) as hookName}
        <label class:checked={opts.hook === hookName}>
          <input type="radio" bind:group={opts.hook} value={hookName} />
          {hookName}
          <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#Pausable">
            @TBD Privileged accounts will be able to pause the functionality marked as <code>whenNotPaused</code>. Useful for
            emergency response.
          </HelpTooltip>
        </label>
    {/each}
  </div>

</section>

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

<ExpandableToggleRadio
  label="Shares"
  bind:value={opts.shares.options}
  defaultValue="ERC20"
  helpContent="Use ERC20 or ERC6909 to represent shares of a pool."
  helpLink="https://docs.openzeppelin.com/contracts/api/token/erc20"
>
  <div class="checkbox-group">
    <label class:checked={opts.shares.options === 'ERC20'}>
      <input type="radio" bind:group={opts.shares.options} value="ERC20" />
      ERC-20
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc20">
        ERC-20 is the standard for fungible tokens.
      </HelpTooltip>
    </label>

    <label class:checked={opts.shares.options === 'ERC6909'}>
      <input type="radio" bind:group={opts.shares.options} value="ERC6909" />
      ERC-6909
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc6909">
        ERC-6909 is a standard for non-fungible tokens.
      </HelpTooltip>
    </label>
  </div>
  <div style="height: 0.5rem;"></div>
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
</ExpandableToggleRadio>

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<section class="controls-section">
  <h1>Utilities</h1>

  <div class="checkbox-group">
    <label class:checked={opts.currencySettler}>
      <input type="checkbox" bind:checked={opts.currencySettler} />
      CurrencySettler
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#Pausable">
        @TBD Privileged accounts will be able to pause the functionality marked as <code>whenNotPaused</code>. Useful for
        emergency response.
      </HelpTooltip>
    </label>

    <label class:checked={opts.safeCast}>
      <input type="checkbox" bind:checked={opts.safeCast} />
      SafeCast
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#Pausable">
        @TBD Privileged accounts will be able to pause the functionality marked as <code>whenNotPaused</code>. Useful for
        emergency response.
      </HelpTooltip>
    </label>

    <label class:checked={opts.transientStorage}>
      <input type="checkbox" bind:checked={opts.transientStorage} />
      Transient Storage
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#Pausable">
        @TBD Privileged accounts will be able to pause the functionality marked as <code>whenNotPaused</code>. Useful for
        emergency response.
      </HelpTooltip>
    </label>
  </div>
</section>

<InfoSection bind:info={opts.info} />
