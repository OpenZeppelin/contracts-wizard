<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard';
  import { erc1155, infoDefaults } from '@openzeppelin/wizard';

  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilitySection from './UpgradeabilitySection.svelte';
  import InfoSection from './InfoSection.svelte';
  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';

  export let opts: Required<KindedOptions['ERC1155']> = {
    kind: 'ERC1155',
    ...erc1155.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;
  export let omitFeatures: string[] | undefined = undefined;

  $: requireAccessControl = erc1155.isAccessControlRequired(opts);

  $: showAllowOverride = opts.crossChainBridging === 'erc7786native';
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <label class="labeled-input">
    <span>Name</span>
    <input bind:value={opts.name} />
  </label>
  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      URI
      <HelpTooltip
        >Location of the metadata. Clients will replace any instance of {'{id}'} in this string with the tokenId.</HelpTooltip
      >
    </span>
    <input bind:value={opts.uri} placeholder="https://..." />
  </label>
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
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/token/erc1155#ERC1155Burnable">
        Token holders will be able to destroy their tokens.
      </HelpTooltip>
    </label>
    <label class:checked={opts.supply}>
      <input type="checkbox" bind:checked={opts.supply} />
      Supply Tracking
      <HelpTooltip>Keeps track of total supply of tokens.</HelpTooltip>
    </label>
    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable} />
      Pausable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/utils#Pausable">
        Privileged accounts will be able to pause the functionality marked as <code>whenNotPaused</code>. Useful for
        emergency response.
      </HelpTooltip>
    </label>
    <label class:checked={opts.updatableUri}>
      <input type="checkbox" bind:checked={opts.updatableUri} />
      Updatable URI
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/token/erc1155#ERC1155-_setURI-string-">
        Privileged accounts will be able to set a new URI for all token types. Clients will replace any instance of {'{id}'}
        in the URI with the tokenId.
      </HelpTooltip>
    </label>
  </div>
</section>

{#if !omitFeatures?.includes('crossChainBridging')}
  <ExpandableToggleRadio
    label="Crosschain Bridging"
    bind:value={opts.crossChainBridging}
    defaultValue="erc7786native"
    helpContent="Adds built-in support to mint and burn tokens for crosschain transfers with registered counterparts."
    helpLink="https://docs.openzeppelin.com/contracts/5.x/api/token/erc1155#ERC1155Crosschain"
  >
    <div class="checkbox-group">
      <label class:checked={opts.crossChainBridging === 'erc7786native'}>
        <input type="radio" bind:group={opts.crossChainBridging} value="erc7786native" />
        ERC-7786 Native
        <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/token/erc1155#ERC1155Crosschain"
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
{/if}

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<UpgradeabilitySection bind:upgradeable={opts.upgradeable} />

<InfoSection bind:info={opts.info} {errors} />
