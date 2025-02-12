<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions } from '@openzeppelin/wizard';
  import { erc20, premintPattern, infoDefaults } from '@openzeppelin/wizard';

  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilitySection from './UpgradeabilitySection.svelte';
  import InfoSection from './InfoSection.svelte';
  import ToggleRadio from '../common/inputs/ToggleRadio.svelte';
  import OPIcon from '../common/icons/OPIcon.svelte';

  export let opts: Required<KindedOptions['ERC20']> = {
    kind: 'ERC20',
    ...erc20.defaults,
    premint: '', // default to empty premint in UI instead of 0
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  $: requireAccessControl = erc20.isAccessControlRequired(opts);

  // Show notice when SuperchainERC20 is enabled
  import tippy, { Instance as TippyInstance } from 'tippy.js';
  import { onMount } from 'svelte';

  let superchainLabel: HTMLElement;
  let superchainTooltip: TippyInstance;
  onMount(() => {
    superchainTooltip = tippy(superchainLabel, {
      content: '<strong>Important:</strong> Requires deploying your ERC20 contract to the same address on every chain in the Superchain. <a class="light-link" href="https://docs.optimism.io/stack/interop/superchain-erc20#requirements" target="_blank" rel="noopener noreferrer">Read more.</a>',
      trigger: 'manual',
      placement: 'bottom',
      maxWidth: '22em',
      allowHTML: true,
      interactive: true,
    });
  });

  let wasSuperchain = false;
  $: {
    if (!wasSuperchain && opts.bridgeable === 'superchain') {
      superchainTooltip.show();
    }
    wasSuperchain = opts.bridgeable === 'superchain';
  }
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

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Cross-Chain Bridging*</span>
      <span class="ml-1">
        <ToggleRadio bind:value={opts.bridgeable} defaultValue={true} />
      </span>
      <HelpTooltip align="right" link="https://docs.openzeppelin.com/community-contracts/api/token#ERC20Bridgeable">
        Allows authorized bridge contracts to mint and burn tokens for cross-chain transfers.
      </HelpTooltip>
    </label>
  </h1>

  <div class="checkbox-group">
    <label class:checked={opts.bridgeable === true}>
      <input type="radio" bind:group={opts.bridgeable} value={true}>
      Custom*
      <HelpTooltip>
        Uses custom bridge contract(s) as authorized token bridge(s).
      </HelpTooltip>
    </label>

    <label class:checked={opts.bridgeable === 'superchain'} bind:this={superchainLabel}>
      <input type="radio" bind:group={opts.bridgeable} value="superchain">
      <OPIcon />&nbsp;SuperchainERC20*
      <HelpTooltip link="https://docs.optimism.io/stack/interop/superchain-erc20">
        Uses the predeployed <code>SuperchainTokenBridge</code> contract on Superchain-compatible networks as the authorized token bridge.
      </HelpTooltip>
    </label>
  </div>

  <div class="text-sm text-gray-500">
    <strong>* Experimental:</strong> <span class="italic">This feature is not audited and is subject to change</span>
  </div>
</section>

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<UpgradeabilitySection bind:upgradeable={opts.upgradeable} disabled={opts.bridgeable !== false}/>

<InfoSection bind:info={opts.info} />
