<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-cairo';
  import { erc721, infoDefaults } from '@openzeppelin/wizard-cairo';

  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilityField from './UpgradeabilityField.svelte';
  import RoyaltyInfoSection from './RoyaltyInfoSection.svelte';
  import InfoSection from './InfoSection.svelte';
  import { error } from '../common/error-tooltip';

  export const opts: Required<KindedOptions['ERC721']> = {
    kind: 'ERC721',
    ...erc721.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = erc721.isAccessControlRequired(opts);
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <div class="grid grid-cols-[2fr,1fr] gap-2">
    <label class="labeled-input">
      <span>Name</span>
      <input bind:value={opts.name} use:error={errors?.name}>
    </label>
    <label class="labeled-input">
      <span>Symbol</span>
      <input bind:value={opts.symbol} use:error={errors?.symbol}>
    </label>
  </div>
  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Base URI
      <HelpTooltip>Will be concatenated with token IDs to generate the token URIs.</HelpTooltip>
    </span>
    <input bind:value={opts.baseUri} placeholder="https://...">
  </label>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.mintable}>
      <input type="checkbox" bind:checked={opts.mintable}>
      Mintable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/erc721">
        Privileged accounts will be able to emit new tokens.
      </HelpTooltip>
    </label>
    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable}>
      Burnable
      <HelpTooltip>
        Token holders will be able to destroy their tokens.
      </HelpTooltip>
    </label>
    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable}>
      Pausable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/security#pausable">
        Privileged accounts will be able to pause the functionality marked with <code>self.pausable.assert_not_paused()</code>.
        Useful for emergency response.
      </HelpTooltip>
    </label>
    <label class:checked={opts.enumerable}>
      <input type="checkbox" bind:checked={opts.enumerable}>
      Enumerable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/api/erc721#ERC721EnumerableComponent">
        Allows a contract to publish its entire list of NFTs and make them discoverable by keeping track of all token ids and all tokens owned by an address.
      </HelpTooltip>
    </label>
    <UpgradeabilityField bind:upgradeable={opts.upgradeable} />
  </div>
</section>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Votes</span>
      <span class="ml-1">
        <input type="checkbox" bind:checked={opts.votes}>
      </span>
      <HelpTooltip align="right" link="https://docs.openzeppelin.com/contracts-cairo/governance/votes">
        Keeps track of historical balances for voting in on-chain governance, with a way to delegate one's voting power to a trusted account.
      </HelpTooltip>
    </label>
  </h1>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Application Name
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/guides/snip12">Name for domain separator. Prevents two applications from producing the same hash.</HelpTooltip>
    </span>
    <input bind:value={opts.appName} use:error={errors?.appName} disabled={!opts.votes}>
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Application Version
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/guides/snip12">Version for domain separator. Prevents two versions of the same application from producing the same hash.</HelpTooltip>
    </span>
    <input bind:value={opts.appVersion} use:error={errors?.appVersion} disabled={!opts.votes}>
  </label>
</section>

<RoyaltyInfoSection bind:opts={opts.royaltyInfo} errors={errors} />

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<InfoSection bind:info={opts.info} />