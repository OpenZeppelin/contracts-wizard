<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-zama';
  import { erc20, premintPattern, chainIdPattern, infoDefaults } from '@openzeppelin/wizard-zama';

  import InfoSection from './InfoSection.svelte';
  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import OPIcon from '../common/icons/OPIcon.svelte';
  import { error } from '../common/error-tooltip';
  import { resizeToFit } from '../common/resize-to-fit';
  import { superchainTooltipProps } from './superchain-tooltip';

  export let opts: Required<KindedOptions['ERC20']> = {
    kind: 'ERC20',
    ...erc20.defaults,
    premint: '', // default to empty premint in UI instead of 0
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = erc20.isAccessControlRequired(opts);

  // Show notice when SuperchainERC20 is enabled
  import tippy, { type Instance as TippyInstance } from 'tippy.js';
  import { onMount } from 'svelte';

  let superchainLabel: HTMLElement;
  let superchainTooltip: TippyInstance;
  onMount(() => {
    superchainTooltip = tippy(superchainLabel, superchainTooltipProps);
  });

  let wasSuperchain = false;
  $: {
    if (!wasSuperchain && opts.crossChainBridging === 'superchain') {
      superchainTooltip.show();
    }
    wasSuperchain = opts.crossChainBridging === 'superchain';
  }

  let showChainId = false;
  $: {
    showChainId = opts.premint !== '' && opts.premint !== '0' && opts.crossChainBridging !== false;
  }
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <div class="grid grid-cols-[2fr,1fr] gap-2">
    <label class="labeled-input">
      <span>Name</span>
      <input bind:value={opts.name} />
    </label>

    <label class="labeled-input">
      <span>Symbol</span>
      <input bind:value={opts.symbol} />
    </label>
  </div>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Premint
      <HelpTooltip>Create an initial amount of tokens for the deployer.</HelpTooltip>
    </span>
    <input bind:value={opts.premint} placeholder="0" pattern={premintPattern.source} use:error={errors?.premint} />
  </label>

  {#if showChainId}
    <p class="subcontrol tooltip-container flex justify-between items-center pr-2">
      <label class="text-sm flex-1">
        &nbsp;Chain ID:
        <input
          type="number"
          bind:value={opts.premintChainId}
          placeholder={''}
          pattern={chainIdPattern.source}
          class="input-inline"
          use:resizeToFit
          use:error={errors?.premintChainId}
        />
      </label>
      <HelpTooltip>Chain ID of the network on which to premint tokens.</HelpTooltip>
    </p>
  {/if}
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.mintable}>
      <input type="checkbox" bind:checked={opts.mintable} />
      Wrappable
      <HelpTooltip>TBD</HelpTooltip>
    </label>
  </div>
</section>

<ExpandableToggleRadio
  label="Votes"
  bind:value={opts.votes}
  defaultValue="blocknumber"
  helpContent="Keeps track of historical balances for voting in on-chain governance, with a way to delegate one's voting power to a trusted account."
  helpLink="https://docs.openzeppelin.com/contracts/api/token/erc20#ERC20Votes"
>
  <div class="checkbox-group">
    <label class:checked={opts.votes === 'blocknumber'}>
      <input type="radio" bind:group={opts.votes} value="blocknumber" />
      Block Number
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/governance#governor">
        Uses voting durations expressed as block numbers.
      </HelpTooltip>
    </label>
    <label class:checked={opts.votes === 'timestamp'}>
      <input type="radio" bind:group={opts.votes} value="timestamp" />
      Timestamp
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/governance#timestamp_based_governance">
        Uses voting durations expressed as timestamps.
      </HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>

<InfoSection bind:info={opts.info} />
