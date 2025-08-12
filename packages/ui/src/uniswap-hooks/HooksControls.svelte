<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions } from '@openzeppelin/wizard-uniswap-hooks/src';
  import { infoDefaults } from '@openzeppelin/wizard';
  import { hooks } from '@openzeppelin/wizard-uniswap-hooks/src';

  import AccessControlSection from './AccessControlSection.svelte';
  import InfoSection from './InfoSection.svelte';

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

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<InfoSection bind:info={opts.info} />
