<script lang="ts">
  import HelpTooltip from './HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard';
  import { premintPattern, governorDefaults as defaults } from '@openzeppelin/wizard';

  import ToggleRadio from './inputs/ToggleRadio.svelte';
  import UpgradeabilitySection from './UpgradeabilitySection.svelte';
  import { error } from './error-tooltip';
  import { resizeToFit } from './resize-to-fit';

  export const opts: Required<KindedOptions['Governor']> = {
    kind: 'Governor',
    name: 'MyGovernor',
    delay: '1 block',
    period: '1 week',
    blockTime: defaults.blockTime,
    proposalThreshold: '',
    decimals: 18,
    quorumMode: 'percent',
    quorumPercent: defaults.percent,
    quorumAbsolute: '',
    votes: 'erc20votes',
    timelock: 'openzeppelin',
    bravo: false,
    upgradeable: false,
    access: 'ownable',
  };

  let quorumAbsoluteInput: HTMLInputElement;
  const focusQuorumAbsolute = () => {
    if (errors) {
      errors.quorumAbsolute = undefined;
      quorumAbsoluteInput.focus();
    }
  };

  export let errors: undefined | OptionsErrorMessages;
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <label class="labeled-input">
    <span>Name</span>
    <input bind:value={opts.name}>
  </label>

  <div class="grid grid-cols-1-1 grid-gap-2">
    <label class="labeled-input">
      <span>Voting Delay</span>
      <input bind:value={opts.delay} use:error={errors?.delay}>
    </label>

    <label class="labeled-input">
      <span>Voting Period</span>
      <input bind:value={opts.period} use:error={errors?.period}>
    </label>
  </div>

  <p>
    <label class="text-small">
      1 block =
      <input type="number" step="0.01" placeholder={defaults.blockTime.toString()} bind:value={opts.blockTime} class="input-inline" use:resizeToFit>
      seconds
    </label>
  </p>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Proposal Threshold
      <HelpTooltip>Create an initial amount of tokens for the deployer.</HelpTooltip>
    </span>
    <input bind:value={opts.proposalThreshold} placeholder="0" use:error={errors?.proposalThreshold}>
  </label>

  <label class="labeled-input" for="quorum-input">
    <span class="flex justify-between pr-2">
      <span>
        Quorum
        <label>% <input type="radio" bind:group={opts.quorumMode} value="percent"></label>
        <label># <input type="radio" bind:group={opts.quorumMode} value="absolute" on:change={focusQuorumAbsolute}></label>
      </span>
      <HelpTooltip>Create an initial amount of tokens for the deployer.</HelpTooltip>
    </span>
    {#if opts.quorumMode === 'percent'}
      <input id="quorum-input" type="number" bind:value={opts.quorumPercent} placeholder={defaults.quorumPercent.toString()} use:error={errors?.quorumPercent}>
    {:else}
      <input id="quorum-input" bind:value={opts.quorumAbsolute} use:error={errors?.quorumAbsolute} bind:this={quorumAbsoluteInput}>
    {/if}
  </label>

  <p>
    <label class="text-small">
      Token decimals:
      <input type="number" bind:value={opts.decimals} placeholder={defaults.decimals.toString()} class="input-inline" use:resizeToFit>
    </label>
  </p>

  <div class="checkbox-group">
    <label class:checked={opts.bravo}>
      <input type="checkbox" bind:checked={opts.bravo}>
      Bravo Compatible
      <HelpTooltip>
        Privileged accounts will be able to create more supply.
      </HelpTooltip>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>Votes</h1>

  <div class="checkbox-group">
    <label class:checked={opts.votes === 'erc20votes'}>
      <input type="radio" bind:group={opts.votes} value="erc20votes">
      ERC20Votes
      <HelpTooltip>
        Privileged accounts will be able to create more supply.
      </HelpTooltip>
    </label>

    <label class:checked={opts.votes === 'comp'}>
      <input type="radio" bind:group={opts.votes} value="comp">
      COMP-like
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Burnable">
        Token holders will be able to destroy their tokens.
      </HelpTooltip>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Timelock</span>
      <span class="ml-1">
        <ToggleRadio bind:value={opts.timelock} defaultValue="openzeppelin" />
      </span>
      <HelpTooltip align="right" link="https://docs.openzeppelin.com/openzeppelin/upgrades">
      Smart contracts are immutable by default unless deployed behind an upgradeable proxy.
      </HelpTooltip>
    </label>
  </h1>
  
  <div class="checkbox-group">
    <label class:checked={opts.timelock === 'openzeppelin'}>
      <input type="radio" bind:group={opts.timelock} value="openzeppelin">
      TimelockController
      <HelpTooltip>
        Privileged accounts will be able to create more supply.
      </HelpTooltip>
    </label>

    <label class:checked={opts.timelock === 'compound'}>
      <input type="radio" bind:group={opts.timelock} value="compound">
      Compound
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Burnable">
        Token holders will be able to destroy their tokens.
      </HelpTooltip>
    </label>
  </div>
</section>

<UpgradeabilitySection bind:upgradeable={opts.upgradeable} />
