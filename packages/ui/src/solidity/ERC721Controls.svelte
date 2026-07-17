<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard';
  import { erc721, infoDefaults } from '@openzeppelin/wizard';

  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilitySection from './UpgradeabilitySection.svelte';
  import InfoSection from './InfoSection.svelte';
  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';

  export let opts: Required<KindedOptions['ERC721']> = {
    kind: 'ERC721',
    ...erc721.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  let wasMintable = opts.mintable;
  let wasIncremental = opts.incremental;

  $: {
    if (wasMintable && !opts.mintable) {
      opts.incremental = false;
    }

    if (opts.incremental && !wasIncremental) {
      opts.mintable = true;
    }

    wasMintable = opts.mintable;
    wasIncremental = opts.incremental;
  }

  $: requireAccessControl = erc721.isAccessControlRequired(opts);

  // Show notice when Auto Increment Ids is combined with Cross-Chain Bridging
  import tippy, { type Instance as TippyInstance } from 'tippy.js';
  import { onMount } from 'svelte';
  import { crosschainIncrementalTooltipProps } from './crosschain-incremental-tooltip';

  let incrementalLabel: HTMLElement;
  let bridgingLabel: HTMLElement;
  let incrementalTooltip: TippyInstance | undefined;
  let bridgingTooltip: TippyInstance | undefined;
  onMount(() => {
    incrementalTooltip = tippy(incrementalLabel, crosschainIncrementalTooltipProps);
    bridgingTooltip = tippy(bridgingLabel, crosschainIncrementalTooltipProps);
  });

  let hadIncremental = opts.incremental;
  let hadCrossChainBridging = opts.crossChainBridging;
  $: {
    if (opts.incremental && opts.crossChainBridging === 'erc7786native') {
      if (!hadIncremental) {
        incrementalTooltip?.show();
      } else if (hadCrossChainBridging === false) {
        bridgingTooltip?.show();
      }
    }
    hadIncremental = opts.incremental;
    hadCrossChainBridging = opts.crossChainBridging;
  }

  let showAllowOverride = false;
  $: {
    showAllowOverride = opts.crossChainBridging === 'erc7786native';
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
      Base URI
      <HelpTooltip>Will be concatenated with token IDs to generate the token URIs.</HelpTooltip>
    </span>
    <input bind:value={opts.baseUri} placeholder="https://..." />
  </label>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.mintable}>
      <input type="checkbox" bind:checked={opts.mintable} />
      Mintable
      <HelpTooltip>Privileged accounts will be able to emit new tokens.</HelpTooltip>
    </label>
    <label class:checked={opts.incremental} class="subcontrol" bind:this={incrementalLabel}>
      <input type="checkbox" bind:checked={opts.incremental} />
      Auto Increment Ids
      <HelpTooltip>New tokens will be automatically assigned an incremental id.</HelpTooltip>
    </label>
    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable} />
      Burnable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/token/erc721#ERC721Burnable">
        Token holders will be able to destroy their tokens.
      </HelpTooltip>
    </label>
    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable} />
      Pausable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/utils#Pausable">
        Privileged accounts will be able to pause the functionality marked as <code>whenNotPaused</code>. Useful for
        emergency response.
      </HelpTooltip>
    </label>
    <label class:checked={opts.enumerable}>
      <input type="checkbox" bind:checked={opts.enumerable} />
      Enumerable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/token/erc721#ERC721Enumerable">
        Allows on-chain enumeration of all tokens or those owned by an account. Increases gas cost of transfers.
      </HelpTooltip>
    </label>
    <label class:checked={opts.uriStorage}>
      <input type="checkbox" bind:checked={opts.uriStorage} />
      URI Storage
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/token/erc721#ERC721URIStorage">
        Allows updating token URIs for individual token IDs.
      </HelpTooltip>
    </label>
  </div>
</section>

<ExpandableToggleRadio
  label="Votes"
  bind:value={opts.votes}
  defaultValue="blocknumber"
  helpContent="Keeps track of individual units for voting in on-chain governance, with a way to delegate one's voting power to a trusted account."
  helpLink="https://docs.openzeppelin.com/contracts/5.x/api/token/erc721#ERC721Votes"
>
  <div class="checkbox-group">
    <label class:checked={opts.votes === 'blocknumber'}>
      <input type="radio" bind:group={opts.votes} value="blocknumber" />
      Block Number
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/governance#governor">
        Uses voting durations expressed as block numbers.
      </HelpTooltip>
    </label>
    <label class:checked={opts.votes === 'timestamp'}>
      <input type="radio" bind:group={opts.votes} value="timestamp" />
      Timestamp
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/governance#timestamp_based_governance">
        Uses voting durations expressed as timestamps.
      </HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>

<ExpandableToggleRadio
  label="Cross-Chain Bridging"
  bind:value={opts.crossChainBridging}
  defaultValue="erc7786native"
  helpContent="Makes the token natively crosschain: outbound transfers burn the token on the source chain, and inbound transfers mint it on the destination chain."
  helpLink="https://docs.openzeppelin.com/contracts/5.x/api/token/erc721#ERC721Crosschain"
>
  <div class="checkbox-group">
    <label class:checked={opts.crossChainBridging === 'erc7786native'} bind:this={bridgingLabel}>
      <input type="radio" bind:group={opts.crossChainBridging} value="erc7786native" />
      ERC-7786 Native
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/token/erc721#ERC721Crosschain"
        >Embeds an ERC-7786 based bridge directly in the token contract, making it natively crosschain.</HelpTooltip
      >
    </label>

    {#if showAllowOverride}
      <p class="subcontrol tooltip-container flex justify-between items-center pr-2">
        <label class="text-sm flex-1">
          <input type="checkbox" bind:checked={opts.crossChainLinkAllowOverride} />
          Allow Link Overrides
        </label>
        <HelpTooltip>Whether to allow replacing a crosschain link that has already been registered.</HelpTooltip>
      </p>
    {/if}
  </div>
</ExpandableToggleRadio>

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<UpgradeabilitySection
  bind:upgradeable={opts.upgradeable}
  namespaceRequired={opts.upgradeable !== false && opts.mintable && opts.incremental}
  bind:namespacePrefix={opts.namespacePrefix}
  {errors}
/>

<InfoSection bind:info={opts.info} {errors} />
