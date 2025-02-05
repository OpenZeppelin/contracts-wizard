<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-cairo';
  import { vesting, infoDefaults } from '@openzeppelin/wizard-cairo';

  import InfoSection from './InfoSection.svelte';
  import { error } from '../common/error-tooltip';

  export const opts: Required<KindedOptions['Vesting']> = {
    kind: 'Vesting',
    ...vesting.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Start date (UTC)
      <HelpTooltip>The timestamp marking the beginning of the vesting period.</HelpTooltip>
    </span>
    <input type="datetime-local" bind:value={opts.startDate} placeholder="" use:error={errors?.startDate}>
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Duration
      <HelpTooltip>The total duration of the vesting period.</HelpTooltip>
    </span>
    <input bind:value={opts.duration} placeholder="0" use:error={errors?.duration}>
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Cliff duration
      <HelpTooltip>The duration of the cliff period. Must be less than or equal to the total duration.</HelpTooltip>
    </span>
    <input bind:value={opts.cliffDuration} placeholder="0" use:error={errors?.cliffDuration}>
  </label>

</section>

<section class="controls-section">
  <h1>Vesting Schedule</h1>
  <div class="checkbox-group">
    <label class:checked={opts.schedule === "linear"}>
      <input type="radio" bind:group={opts.schedule} value="linear">
      Linear
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/api/finance#LinearVestingSchedule">
        A vesting schedule implementation when tokens are vested gradually following a linear curve.
      </HelpTooltip>
    </label>
    <label class:checked={opts.schedule === "custom"}>
      <input type="radio" bind:group={opts.schedule} value="custom">
      Custom
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/api/finance#VestingComponent-Vesting-Schedule">
        A custom vesting schedule that requires the implementation of the VestingSchedule trait.
      </HelpTooltip>
    </label>
  </div>
</section>

<InfoSection bind:info={opts.info} />
