<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-cairo';
  import { governor, infoDefaults } from '@openzeppelin/wizard-cairo';

  import ToggleRadio from '../common/inputs/ToggleRadio.svelte';
  import UpgradeabilityField from './UpgradeabilityField.svelte';
  import InfoSection from './InfoSection.svelte';

  import { error } from '../common/error-tooltip';
  import { resizeToFit } from '../common/resize-to-fit';

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
    <UpgradeabilityField bind:upgradeable={opts.upgradeable} />
  </div>
</section>

<section class="controls-section">
  <h1>Votes</h1>

  <div class="checkbox-group">
    <label class:checked={opts.votes === 'erc20votes'}>
      <input type="radio" bind:group={opts.votes} value="erc20votes">
      ERC20Votes
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/api/governance#VotesComponent">
        Represent voting power with a votes-enabled ERC20 token. Voters can entrust their voting power to a delegate.
      </HelpTooltip>
    </label>

    <label class:checked={opts.votes === 'erc721votes'}>
      <input type="radio" bind:group={opts.votes} value="erc721votes">
      ERC721Votes
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/api/governance#VotesComponent">
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
        <b>NOTE:</b> This setting must be the same as what the token uses. For now, only timestamp mode is supported.
      </HelpTooltip>
    </label>
  </h1>

  <div class="checkbox-group">
    <label class:checked={opts.clockMode === 'timestamp'}>
      <input type="radio" bind:group={opts.clockMode} value="timestamp">
      Timestamp
      <HelpTooltip>
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
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/api/governance#TimelockControllerComponent">
        Module compatible with OpenZeppelin's <code>TimelockController</code>.
      </HelpTooltip>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex justify-between items-center tooltip-container pr-2">
      <span>SNIP12 Metadata</span>
      <HelpTooltip>
        Metadata for the SNIP12 domain separator.
      </HelpTooltip>
    </label>
  </h1>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Application Name
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/guides/snip12">Name for domain separator. Prevents two applications from producing the same hash.</HelpTooltip>
    </span>
    <input bind:value={opts.appName} use:error={errors?.appName}>
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Application Version
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/guides/snip12">Version for domain separator. Prevents two versions of the same application from producing the same hash.</HelpTooltip>
    </span>
    <input bind:value={opts.appVersion} use:error={errors?.appVersion}>
  </label>
</section>

<InfoSection bind:info={opts.info} />
