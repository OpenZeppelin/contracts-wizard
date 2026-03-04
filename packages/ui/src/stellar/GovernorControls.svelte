<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-stellar';
  import { governor, infoDefaults } from '@openzeppelin/wizard-stellar';

  import InfoSection from './InfoSection.svelte';
  import { error } from '../common/error-tooltip';

  export let opts: Required<KindedOptions['Governor']> = {
    kind: 'Governor',
    ...governor.defaults,
    info: { ...infoDefaults },
  };

  export let errors: undefined | OptionsErrorMessages;
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <div class="grid grid-cols-[2fr,1fr] gap-2">
    <label class="labeled-input">
      <span>Name</span>
      <input bind:value={opts.name} use:error={errors?.name} />
    </label>

    <label class="labeled-input">
      <span>Version</span>
      <input bind:value={opts.version} use:error={errors?.version} />
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>Governance Parameters</h1>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Voting Delay
      <HelpTooltip>Number of ledgers before voting starts after a proposal is created.</HelpTooltip>
    </span>
    <input bind:value={opts.votingDelay} use:error={errors?.votingDelay} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Voting Period
      <HelpTooltip>Number of ledgers voting remains open.</HelpTooltip>
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
      <HelpTooltip>Minimum participation required for a proposal to pass.</HelpTooltip>
    </span>
    <input bind:value={opts.quorum} use:error={errors?.quorum} />
  </label>
</section>

<InfoSection bind:info={opts.info} />
