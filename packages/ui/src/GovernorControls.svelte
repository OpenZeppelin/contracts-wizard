<script lang="ts">
  import HelpTooltip from './HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard';
  import { governor, infoDefaults } from '@openzeppelin/wizard';

  import ToggleRadio from './inputs/ToggleRadio.svelte';
  import UpgradeabilitySection from './UpgradeabilitySection.svelte';
  import InfoSection from './InfoSection.svelte';
  
  import { error } from './error-tooltip';
  import { resizeToFit } from './resize-to-fit';

  const defaults = governor.defaults;

  export let opts: Required<KindedOptions['Governor']> = {
    kind: 'Governor',
    ...defaults,
    proposalThreshold: '', // default to empty in UI
    quorumAbsolute: '', // default to empty in UI
    info: { ...infoDefaults }, // create new object since Info is nested
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

  let wasERC721Votes = opts.votes === 'erc721votes';
  let previousDecimals = opts.decimals;
  let disabledDecimals: boolean;

  $: {
    if (wasERC721Votes && opts.votes !== 'erc721votes') {
      opts.decimals = previousDecimals;
      disabledDecimals = false;
    } else if (!wasERC721Votes && opts.votes === 'erc721votes') {
      previousDecimals = opts.decimals;
      opts.decimals = 0;     
      disabledDecimals = true;
    }

    wasERC721Votes = opts.votes === 'erc721votes';
  }

</script>

<section class="controls-section">
  <h1>Settings</h1>

  <label class="labeled-input">
    <span>Name</span>
    <input bind:value={opts.name}>
  </label>

  <div class="grid grid-cols-2 gap-2">
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
    <label class="text-sm">
      Token decimals:
      <input disabled={disabledDecimals} type="number" bind:value={opts.decimals} placeholder={defaults.decimals.toString()} class="input-inline" use:resizeToFit use:error={errors?.decimals}>
    </label>
    <HelpTooltip>Token amounts above will be extended with this number of zeroes. Does not apply to ERC721Votes.</HelpTooltip>
  </p>

  <div class="checkbox-group">
    <label class:checked={opts.settings}>
      <input type="checkbox" bind:checked={opts.settings}>
      Updatable Settings
      <HelpTooltip>
        Allow governance to update voting settings (delay, period, proposal threshold).
      </HelpTooltip>
    </label>

    <label class:checked={opts.storage}>
      <input type="checkbox" bind:checked={opts.storage}>
      Storage
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/governance#GovernorStorage">
        Enable storage of proposal details and enumerability of proposals.
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
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc20#ERC20Votes">
        Represent voting power with a votes-enabled ERC20 token. Voters can entrust their voting power to a delegate.
      </HelpTooltip>
    </label>

    <label class:checked={opts.votes === 'erc721votes'}>
      <input type="radio" bind:group={opts.votes} value="erc721votes">
      ERC721Votes
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc721#ERC721Votes">
        Represent voting power with a votes-enabled ERC721 token. Voters can entrust their voting power to a delegate.
      </HelpTooltip>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex justify-between items-center tooltip-container pr-2">
      <span>Token Clock Mode</span>
      <HelpTooltip>
        The clock mode used by the voting token.
        <br>
        <b>NOTE:</b> This setting must be the same as what the token uses.
      </HelpTooltip>
    </label>
  </h1>

  <div class="checkbox-group">
    <label class:checked={opts.clockMode === 'blocknumber'}>
      <input type="radio" bind:group={opts.clockMode} value="blocknumber">
      Block Number
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/governance#governor">
        The token uses voting durations expressed as block numbers.
      </HelpTooltip>
    </label>
    <p class="tooltip-container flex justify-between items-center pr-2">
      <label class="text-sm">
        1 block =
        <input type="number" step="0.01" placeholder={defaults.blockTime.toString()} bind:value={opts.blockTime} class="input-inline" disabled={opts.clockMode === 'timestamp'} use:resizeToFit>
        seconds
      </label>
      <HelpTooltip>
        Assumed block time for converting voting time periods into block numbers.
        <br>
        Block time may drift and impact these periods in the future.
      </HelpTooltip>
    </p>

    <label class:checked={opts.clockMode === 'timestamp'}>
      <input type="radio" bind:group={opts.clockMode} value="timestamp">
      Timestamp
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/governance#timestamp_based_governance">
        The token uses voting durations expressed as timestamps.
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
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/governance#GovernorTimelockControl">
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

<InfoSection bind:info={opts.info} />
