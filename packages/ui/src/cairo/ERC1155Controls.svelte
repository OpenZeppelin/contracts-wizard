<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-cairo';
  import { erc1155, infoDefaults } from '@openzeppelin/wizard-cairo';

  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilityField from './UpgradeabilityField.svelte';
  import RoyaltyInfoSection from './RoyaltyInfoSection.svelte';
  import InfoSection from './InfoSection.svelte';

  export let opts: Required<KindedOptions['ERC1155']> = {
    kind: 'ERC1155',
    ...erc1155.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = erc1155.isAccessControlRequired(opts);
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <label class="labeled-input">
    <span>Name</span>
    <input bind:value={opts.name}>
  </label>
  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Base URI
      <HelpTooltip>Location of the metadata. Clients will replace any instance of {"{id}"} in this string with the tokenId.</HelpTooltip>
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
      <HelpTooltip>
        Privileged accounts will be able to create more supply.
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
    <label class:checked={opts.updatableUri}>
      <input type="checkbox" bind:checked={opts.updatableUri}>
      Updatable URI
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/api/erc1155#ERC1155Component-set_base_uri">
        Privileged accounts will be able to set a new URI for all token types. Clients will replace any instance of {"{id}"} in the URI with the tokenId.
      </HelpTooltip>
    </label>
    <UpgradeabilityField bind:upgradeable={opts.upgradeable} />
  </div>
</section>

<RoyaltyInfoSection bind:opts={opts.royaltyInfo} errors={errors} />

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<InfoSection bind:info={opts.info} />
