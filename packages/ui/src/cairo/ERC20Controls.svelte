<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-cairo';
  import { premintPattern, erc20, infoDefaults } from '@openzeppelin/wizard-cairo';

  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilityField from './UpgradeabilityField.svelte';
  import InfoSection from './InfoSection.svelte';
  import { error } from '../common/error-tooltip';

  export const opts: Required<KindedOptions['ERC20']> = {
    kind: 'ERC20',
    ...erc20.defaults,
    premint: '', // default to empty premint in UI instead of 0
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = erc20.isAccessControlRequired(opts);
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <div class="grid grid-cols-[2fr,1fr] gap-2">
    <label class="labeled-input">
      <span>Name</span>
      <input bind:value={opts.name} use:error={errors?.name}>
    </label>

    <label class="labeled-input">
      <span>Symbol</span>
      <input bind:value={opts.symbol} use:error={errors?.symbol}>
    </label>
  </div>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Premint
      <HelpTooltip>Create an initial amount of tokens for the recipient.</HelpTooltip>
    </span>
    <input bind:value={opts.premint} use:error={errors?.premint} placeholder="0" pattern={premintPattern.source}>
  </label>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.mintable}>
      <input type="checkbox" bind:checked={opts.mintable}>
      Mintable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/guides/erc20-supply">
        Privileged accounts will be able to create more supply.
      </HelpTooltip>
    </label>

    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable}>
      Burnable
      <HelpTooltip>
        Token holders will be able to destroy their tokens.
      </HelpTooltip>
    </label>

    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable}>
      Pausable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/security#pausable">
        Privileged accounts will be able to pause the functionality marked with <code>self.pausable.assert_not_paused()</code>.
        Useful for emergency response.
      </HelpTooltip>
    </label>

    <UpgradeabilityField bind:upgradeable={opts.upgradeable} />
  </div>
</section>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Votes</span>
      <span class="ml-1">
        <input type="checkbox" bind:checked={opts.votes}>
      </span>
      <HelpTooltip align="right" link="https://docs.openzeppelin.com/contracts-cairo/governance/votes">
        Keeps track of historical balances for voting in on-chain governance, with a way to delegate one's voting power to a trusted account.
      </HelpTooltip>
    </label>
  </h1>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Application Name
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/guides/snip12">Name for domain separator. Prevents two applications from producing the same hash.</HelpTooltip>
    </span>
    <input bind:value={opts.appName} use:error={errors?.appName} disabled={!opts.votes}>
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Application Version
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/guides/snip12">Version for domain separator. Prevents two versions of the same application from producing the same hash.</HelpTooltip>
    </span>
    <input bind:value={opts.appVersion} use:error={errors?.appVersion} disabled={!opts.votes}>
  </label>
</section>

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<InfoSection bind:info={opts.info} />
