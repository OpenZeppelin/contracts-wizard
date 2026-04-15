<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-stellar';
  import { governor, infoDefaults } from '@openzeppelin/wizard-stellar';

  import AccessControlSection from './AccessControlSection.svelte';
  import InfoSection from './InfoSection.svelte';
  import TraitImplementationSection from './TraitImplementationSection.svelte';
  import { error } from '../common/error-tooltip';

  export let opts: Required<KindedOptions['Governor']> = {
    kind: 'Governor',
    ...governor.defaults,
    info: { ...infoDefaults },
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = governor.isAccessControlRequired(opts);
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <div class="grid grid-cols-[2fr,1fr] gap-2">
    <label class="labeled-input">
      <span>Name</span>
      <input bind:value={opts.name} use:error={errors?.name} />
    </label>

    <label class="labeled-input">
      <span class="flex justify-between pr-2">
        Version
        <HelpTooltip
          >Semantic version label exposed by the governor's <code>version()</code> function. It is informational; has no effect on
          contract behavior.</HelpTooltip
        >
      </span>
      <input bind:value={opts.version} use:error={errors?.version} />
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>Governance Parameters</h1>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Voting Delay
      <HelpTooltip
        >Number of ledgers before voting starts after a proposal is created (17,000 ledgers are approx. 1 day).</HelpTooltip
      >
    </span>
    <input bind:value={opts.votingDelay} use:error={errors?.votingDelay} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Voting Period
      <HelpTooltip>Number of ledgers voting remains open (120,000 ledgers are approx. 1 week).</HelpTooltip>
    </span>
    <input bind:value={opts.votingPeriod} use:error={errors?.votingPeriod} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Proposal Threshold
      <HelpTooltip>Minimum voting power required to create proposals.</HelpTooltip>
    </span>
    <input bind:value={opts.proposalThreshold} use:error={errors?.proposalThreshold} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Quorum
      <HelpTooltip>Minimum number of votes required for a proposal to pass.</HelpTooltip>
    </span>
    <input bind:value={opts.quorum} use:error={errors?.quorum} />
  </label>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.timelock}>
      <input type="checkbox" bind:checked={opts.timelock} />
      Timelock
      <HelpTooltip>Adds a timelock mechanism that enforces a delay between proposal queuing and execution.</HelpTooltip>
    </label>

    <label class:checked={opts.upgradeable}>
      <input type="checkbox" bind:checked={opts.upgradeable} />
      Upgradeable
      <HelpTooltip
        >Allows the contract to be upgraded by the configured authority (owner or accounts with the upgrader role.</HelpTooltip
      >
    </label>
  </div>
</section>

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<TraitImplementationSection bind:explicitImplementations={opts.explicitImplementations} />

<InfoSection bind:info={opts.info} />
