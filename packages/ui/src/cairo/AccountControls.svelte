<script lang="ts">
    import HelpTooltip from '../HelpTooltip.svelte';
  
    import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-cairo';
    import { account, infoDefaults } from '@openzeppelin/wizard-cairo';
    
    import AccessControlSection from './AccessControlSection.svelte';
    import UpgradeabilityField from './UpgradeabilityField.svelte';
    import InfoSection from './InfoSection.svelte';
    import { error } from '../error-tooltip';
    import ToggleRadio from '../inputs/ToggleRadio.svelte';
    
    export const opts: Required<KindedOptions['Account']> = {
      kind: 'Account',
      ...account.defaults,
      info: { ...infoDefaults }, // create new object since Info is nested
    };
  
    export let errors: undefined | OptionsErrorMessages;
  
    $: requireAccessControl = account.isAccessControlRequired(opts);
  </script>
  
  <section class="controls-section">
    <h1>Account Type</h1>
    <label>
      <input type="checkbox" bind:checked={opts.mintable}>
      Mintable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/account">
        Privileged accounts will be able to emit new tokens.
      </HelpTooltip>
  </section>
  
  <section class="controls-section">
    <h1>Features</h1>
  
    <div class="checkbox-group">
      <label class:checked={opts.mintable}>
        <input type="checkbox" bind:checked={opts.mintable}>
        Declarable
        <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/account">
          Privileged accounts will be able to emit new tokens.
        </HelpTooltip>
      </label>
      <label class:checked={opts.burnable}>
        <input type="checkbox" bind:checked={opts.burnable}>
        Deployable
        <HelpTooltip>
          Token holders will be able to destroy their tokens.
        </HelpTooltip>
      </label>
      <UpgradeabilityField bind:upgradeable={opts.upgradeable} />
    </div>
  </section>
  
  <AccessControlSection bind:access={opts.access} required={requireAccessControl} />
  
  <InfoSection bind:info={opts.info} />
