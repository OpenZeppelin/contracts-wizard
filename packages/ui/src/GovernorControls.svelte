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
    quorumPercent: defaults.quorumPercent,
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
      const prevErrors = errors;
      const prevQuorumError = errors.quorumAbsolute;
      errors.quorumAbsolute = undefined;
      quorumAbsoluteInput.focus();
      setTimeout(() => {
        if (errors === prevErrors) {
          errors.quorumAbsolute = prevQuorumError;
        }
      }, 1000);
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
      <span class="flex justify-between">
        <span>Voting Delay</span>
        <HelpTooltip>Delay since proposal is created until voting starts.</HelpTooltip>
      </span>
      <input bind:value={opts.delay} use:error={errors?.delay}>
    </label>

    <label class="labeled-input">
      <span class="flex justify-between">
        <span>Voting Period</span>
        <HelpTooltip>Length of period during which people can cast their vote.</HelpTooltip>
      </span>
      <input bind:value={opts.period} use:error={errors?.period}>
    </label>
  </div>

  <p class="tooltip-container flex justify-between items-center pr-2">
    <label class="text-small">
      1 block =
      <input type="number" step="0.01" placeholder={defaults.blockTime.toString()} bind:value={opts.blockTime} class="input-inline" use:resizeToFit>
      seconds
    </label>
    <HelpTooltip>
      Assumed block time for converting above time periods into block numbers.
      <br>
      Block time may drift and impact these periods in the future.
    </HelpTooltip>
  </p>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Proposal Threshold
      <HelpTooltip>Minimum number of votes an account must have to create a proposal.</HelpTooltip>
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
      <HelpTooltip>Quorum required for a proposal to pass.</HelpTooltip>
    </span>
    {#if opts.quorumMode === 'percent'}
      <input id="quorum-input" type="number" bind:value={opts.quorumPercent} placeholder={defaults.quorumPercent.toString()} use:error={errors?.quorumPercent}>
    {:else}
      <input id="quorum-input" bind:value={opts.quorumAbsolute} use:error={errors?.quorumAbsolute} bind:this={quorumAbsoluteInput}>
    {/if}
  </label>

  <p class="tooltip-container flex justify-between items-center pr-2">
    <label class="text-small">
      Token decimals:
      <input type="number" bind:value={opts.decimals} placeholder={defaults.decimals.toString()} class="input-inline" use:resizeToFit>
    </label>
    <HelpTooltip>Token amounts above will be extended with this number of zeroes.</HelpTooltip>
  </p>

  <div class="checkbox-group">
    <label class:checked={opts.bravo}>
      <input type="checkbox" bind:checked={opts.bravo}>
      Bravo Compatible
      <HelpTooltip>
        Include full compatibility with <code>GovernorBravo</code>.
        <br>
        May require enabling Solidity optimizer to avoid hitting contract size limit.
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
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Votes">
        Represent voting power with an ERC20 token. Voters can entrust their voting power to a delegate.
      </HelpTooltip>
    </label>

    <label class:checked={opts.votes === 'comp'}>
      <input type="radio" bind:group={opts.votes} value="comp">
      COMP-like
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20VotesComp">
        Similar to <code>ERC20Votes</code>, but based on COMP token or <code>ERC20VotesComp</code>.
      </HelpTooltip>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex justify-between items-center tooltip-container pr-2">
      <span>
        <span>Timelock</span>
        <span class="ml-1">
          <ToggleRadio bind:value={opts.timelock} defaultValue="openzeppelin" />
        </span>
      </span>
      <HelpTooltip>
        Add a delay to actions taken by the Governor. Gives users time to exit the system if they disagree with governance decisions.
      </HelpTooltip>
    </label>
  </h1>
  
  <div class="checkbox-group">
    <label class:checked={opts.timelock === 'openzeppelin'}>
      <input type="radio" bind:group={opts.timelock} value="openzeppelin">
      TimelockController
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/governance#GovernorTimelockControl">
        Module compatible with OpenZeppelin's <code>TimelockController</code>.
        Allows multiple proposers and executors, in addition to the Governor itself.
      </HelpTooltip>
    </label>

    <label class:checked={opts.timelock === 'compound'}>
      <input type="radio" bind:group={opts.timelock} value="compound">
      Compound
      <HelpTooltip link="https://github.com/compound-finance/compound-protocol/blob/master/contracts/Timelock.sol">
        Module compatible with Compound's <code>Timelock</code> contract. Useful if assets and roles are already held in this contract.
      </HelpTooltip>
    </label>
  </div>
</section>

<UpgradeabilitySection bind:upgradeable={opts.upgradeable} />
