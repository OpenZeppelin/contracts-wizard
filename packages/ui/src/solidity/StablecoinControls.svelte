<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard';
  import { stablecoin, premintPattern, chainIdPattern, infoDefaults } from '@openzeppelin/wizard';

  import AccessControlSection from './AccessControlSection.svelte';
  import InfoSection from './InfoSection.svelte';
  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import OPIcon from '../common/icons/OPIcon.svelte';
  import { error } from '../common/error-tooltip';
  import { resizeToFit } from '../common/resize-to-fit';
  import { superchainTooltipProps } from './superchain-tooltip';

  export let opts: Required<KindedOptions['Stablecoin']> = {
    kind: 'Stablecoin',
    ...stablecoin.defaults,
    premint: '', // default to empty premint in UI instead of 0
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = stablecoin.isAccessControlRequired(opts);

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
  <div class="text-sm text-gray-500">
    <strong>* Experimental:</strong>
    <span class="italic">Some of the following features are not audited and are subject to change</span>
  </div>
</section>

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
      Mintable
      <HelpTooltip>Privileged accounts will be able to create more supply.</HelpTooltip>
    </label>

    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable} />
      Burnable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc20#ERC20Burnable">
        Token holders will be able to destroy their tokens.
      </HelpTooltip>
    </label>

    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable} />
      Pausable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#Pausable">
        Privileged accounts will be able to pause the functionality marked as <code>whenNotPaused</code>. Useful for
        emergency response.
      </HelpTooltip>
    </label>

    <label class:checked={opts.callback}>
      <input type="checkbox" bind:checked={opts.callback} />
      Callback
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/token/erc20#ERC1363">
        Supports code execution after transfers and approvals on recipient contracts in a single transaction.
      </HelpTooltip>
    </label>

    <label class:checked={opts.permit || opts.votes}>
      <input type="checkbox" bind:checked={opts.permit} />
      Permit
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc20#ERC20Permit">
        Without paying gas, token holders will be able to allow third parties to transfer from their account.
      </HelpTooltip>
    </label>

    <label class:checked={opts.flashmint}>
      <input type="checkbox" bind:checked={opts.flashmint} />
      Flash Minting
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc20#ERC20FlashMint">
        Built-in flash loans. Lend tokens without requiring collateral as long as they're returned in the same
        transaction.
      </HelpTooltip>
    </label>

    <label class:checked={opts.custodian}>
      <input type="checkbox" bind:checked={opts.custodian} />
      Custodian*
      <HelpTooltip>
        Authorized accounts can freeze and unfreeze accounts for regulatory or security purposes.
      </HelpTooltip>
    </label>
  </div>
</section>

<ExpandableToggleRadio
  label="Limitations*"
  bind:value={opts.limitations}
  defaultValue="allowlist"
  helpContent="Restricts certain users from transferring tokens, either via allowing or blocking them."
>
  <div class="checkbox-group">
    <label class:checked={opts.limitations === 'allowlist'}>
      <input type="radio" bind:group={opts.limitations} value="allowlist" />
      Allowlist*
      <HelpTooltip>Allows a list of addresses to transfer tokens.</HelpTooltip>
    </label>
    <label class:checked={opts.limitations === 'blocklist'}>
      <input type="radio" bind:group={opts.limitations} value="blocklist" />
      Blocklist*
      <HelpTooltip>Blocks a list of addresses from transferring tokens.</HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>

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

<ExpandableToggleRadio
  label="Cross-Chain Bridging*"
  bind:value={opts.crossChainBridging}
  defaultValue="custom"
  helpContent="Allows authorized bridge contracts to mint and burn tokens for cross-chain transfers."
  helpLink="https://docs.openzeppelin.com/community-contracts/api/token#ERC20Bridgeable"
>
  <div class="checkbox-group">
    <label class:checked={opts.crossChainBridging === 'custom'}>
      <input type="radio" bind:group={opts.crossChainBridging} value="custom" />
      Custom*
      <HelpTooltip>Uses custom bridge contract(s) as authorized token bridge(s).</HelpTooltip>
    </label>

    <label class:checked={opts.crossChainBridging === 'superchain'} bind:this={superchainLabel}>
      <input type="radio" bind:group={opts.crossChainBridging} value="superchain" />
      SuperchainERC20* &nbsp;<OPIcon />
      <HelpTooltip link="https://docs.optimism.io/stack/interop/superchain-erc20">
        Uses the predeployed <code>SuperchainTokenBridge</code> contract as the authorized token bridge. Only available on
        chains in the Superchain.
      </HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<InfoSection bind:info={opts.info} />
