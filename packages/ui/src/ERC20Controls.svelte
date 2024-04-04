<script lang="ts">
  import HelpTooltip from './HelpTooltip.svelte';

  import type { KindedOptions } from '@openzeppelin/wizard';
  import { erc20, premintPattern, infoDefaults } from '@openzeppelin/wizard';

  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilitySection from './UpgradeabilitySection.svelte';
  import InfoSection from './InfoSection.svelte';
  import ToggleRadio from './inputs/ToggleRadio.svelte';

  export let opts: Required<KindedOptions['ERC20']> = {
    kind: 'ERC20',
    ...erc20.defaults,
    premint: '', // default to empty premint in UI instead of 0
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  $: requireAccessControl = erc20.isAccessControlRequired(opts);
</script>

<section class="controls-section">
  <h1>Settings</h1>

    <div class="grid grid-cols-[2fr,1fr] gap-2">
      <label class="labeled-input">
        <span>Name</span>
        <input bind:value={opts.name}>
      </label>

      <label class="labeled-input">
        <span>Symbol</span>
        <input bind:value={opts.symbol}>
      </label>
    </div>

    <label class="labeled-input">
      <span class="flex justify-between pr-2">
        Premint
        <HelpTooltip>Create an initial amount of tokens for the deployer.</HelpTooltip>
      </span>
      <input bind:value={opts.premint} placeholder="0" pattern={premintPattern.source}>
    </label>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.mintable}>
      <input type="checkbox" bind:checked={opts.mintable}>
      Mintable
      <HelpTooltip>
        Privileged accounts will be able to create more supply.
      </HelpTooltip>
    </label>

    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable}>
      Burnable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc20#ERC20Burnable">
        Token holders will be able to destroy their tokens.
      </HelpTooltip>
    </label>

    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable}>
      Pausable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#Pausable">
        Privileged accounts will be able to pause the functionality marked as <code>whenNotPaused</code>.
        Useful for emergency response.
      </HelpTooltip>
    </label>

    <label class:checked={opts.permit || opts.votes}>
      <input type="checkbox" bind:checked={opts.permit}>
      Permit
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc20#ERC20Permit">
        Without paying gas, token holders will be able to allow third parties to transfer from their account.
      </HelpTooltip>
    </label>

    <label class:checked={opts.flashmint}>
      <input type="checkbox" bind:checked={opts.flashmint}>
      Flash Minting
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc20#ERC20FlashMint">
        Built-in flash loans. Lend tokens without requiring collateral as long as they're returned in the same transaction.
      </HelpTooltip>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Votes</span>
      <span class="ml-1">
        <ToggleRadio bind:value={opts.votes} defaultValue="blocknumber" />
      </span>
      <HelpTooltip align="right" link="https://docs.openzeppelin.com/contracts/api/token/erc20#ERC20Votes">
        Keeps track of historical balances for voting in on-chain governance, with a way to delegate one's voting power to a trusted account.
      </HelpTooltip>
    </label>
  </h1>

  <div class="checkbox-group">
    <label class:checked={opts.votes === 'blocknumber'}>
      <input type="radio" bind:group={opts.votes} value="blocknumber">
      Block Number
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/governance#governor">
        Uses voting durations expressed as block numbers.
      </HelpTooltip>
    </label>
    <label class:checked={opts.votes === 'timestamp'}>
      <input type="radio" bind:group={opts.votes} value="timestamp">
      Timestamp
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/governance#timestamp_based_governance">
        Uses voting durations expressed as timestamps.
      </HelpTooltip>
    </label>
  </div>
</section>

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<UpgradeabilitySection bind:upgradeable={opts.upgradeable} />

<InfoSection bind:info={opts.info} />
