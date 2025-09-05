<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-confidential';
  import { infoDefaults } from '@openzeppelin/wizard';
  import { confidentialFungible, premintPattern } from '@openzeppelin/wizard-confidential';

  import InfoSection from '../solidity/InfoSection.svelte';
  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import { error } from '../common/error-tooltip';

  export let opts: Required<KindedOptions['ConfidentialFungible']> = {
    kind: 'ConfidentialFungible',
    ...confidentialFungible.defaults,
    premint: '', // default to empty premint in UI instead of 0
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;
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
    <span class="flex justify-between pr-2">Token URI</span>
    <input bind:value={opts.tokenURI} placeholder="https://..." />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Premint
      <HelpTooltip>Create an initial amount of tokens for the deployer.</HelpTooltip>
    </span>
    <input bind:value={opts.premint} placeholder="0" pattern={premintPattern.source} use:error={errors?.premint} />
  </label>

  <div class="labeled-input">
    <span class="flex justify-between pr-2">
      Network Configuration
      <HelpTooltip>Specify the network configuration and provider to use for FHEVM contracts.</HelpTooltip>
    </span>
    <div class="checkbox-group">
      <label class:checked={opts.networkConfig === 'zama-sepolia'}>
        <input type="radio" bind:group={opts.networkConfig} value="zama-sepolia" />
        Sepolia - Zama &nbsp;<img src="icons/zama.png" height="16" alt="Zama" />
      </label>
      <label class:checked={opts.networkConfig === 'zama-ethereum'}>
        <input type="radio" bind:group={opts.networkConfig} value="zama-ethereum" />
        Ethereum - Zama &nbsp;<img src="icons/zama.png" height="16" alt="Zama" />
      </label>
    </div>
  </div>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.wrappable}>
      <input type="checkbox" bind:checked={opts.wrappable} />
      Wrappable
      <HelpTooltip>Allows wrapping an ERC20 token into a confidential fungible token.</HelpTooltip>
    </label>
  </div>
</section>

<ExpandableToggleRadio
  label="Votes"
  bind:value={opts.votes}
  defaultValue="blocknumber"
  helpContent="Keeps track of historical balances for voting in on-chain governance, with a way to delegate one's voting power to a trusted account."
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
