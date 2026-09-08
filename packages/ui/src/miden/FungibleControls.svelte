<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-miden';
  import { amountPattern, fungible, infoDefaults, symbolPattern } from '@openzeppelin/wizard-miden';

  import AccessControlSection from './AccessControlSection.svelte';
  import InfoSection from './InfoSection.svelte';
  import RestrictionsSection from './RestrictionsSection.svelte';
  import { error } from '../common/error-tooltip';

  export let opts: Required<KindedOptions['Fungible']> = {
    kind: 'Fungible',
    ...fungible.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = fungible.isAccessControlRequired(opts);
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <div class="grid grid-cols-[2fr,1fr] gap-2">
    <label class="labeled-input">
      <span>Name</span>
      <input bind:value={opts.name} use:error={errors?.name} />
    </label>

    <label class="labeled-input">
      <span>Symbol</span>
      <input bind:value={opts.symbol} use:error={errors?.symbol} pattern={symbolPattern.source} />
    </label>
  </div>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Decimals
      <HelpTooltip>The number of decimals used to represent token amounts, at most 12. Defaults to 8.</HelpTooltip>
    </span>
    <input bind:value={opts.decimals} use:error={errors?.decimals} placeholder={fungible.defaults.decimals} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Max Supply
      <HelpTooltip>The maximum number of tokens that can ever be minted, in whole tokens.</HelpTooltip>
    </span>
    <input
      bind:value={opts.maxSupply}
      use:error={errors?.maxSupply}
      placeholder={fungible.defaults.maxSupply}
      pattern={amountPattern.source}
    />
  </label>
</section>

<section class="controls-section">
  <h1>Metadata</h1>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Description
      <HelpTooltip>An optional description of the token, at most 195 bytes.</HelpTooltip>
    </span>
    <input bind:value={opts.description} use:error={errors?.description} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Logo URI
      <HelpTooltip>An optional URI of the token logo, at most 195 bytes.</HelpTooltip>
    </span>
    <input bind:value={opts.logoUri} placeholder="https://..." use:error={errors?.logoUri} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      External Link
      <HelpTooltip>An optional link to more information about the token, at most 195 bytes.</HelpTooltip>
    </span>
    <input bind:value={opts.externalLink} placeholder="https://..." use:error={errors?.externalLink} />
  </label>

  <div class="checkbox-group">
    <label class:checked={opts.updatableMetadata}>
      <input type="checkbox" bind:checked={opts.updatableMetadata} />
      Updatable Metadata
      <HelpTooltip>
        Privileged accounts will be able to update the description, logo URI and external link after deployment.
      </HelpTooltip>
    </label>

    <label class:checked={opts.updatableMaxSupply}>
      <input type="checkbox" bind:checked={opts.updatableMaxSupply} />
      Updatable Max Supply
      <HelpTooltip>Privileged accounts will be able to update the maximum supply after deployment.</HelpTooltip>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.burnable} use:error={errors?.burnable}>
      <input type="checkbox" bind:checked={opts.burnable} />
      Burnable
      <HelpTooltip>
        Any token holder will be able to burn their tokens by sending them back to the faucet in a BURN note. Otherwise
        only the owner can burn, which requires access control.
      </HelpTooltip>
    </label>

    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable} />
      Pausable
      <HelpTooltip>
        Privileged accounts will be able to pause minting, burning and transfers. Useful for emergency response.
      </HelpTooltip>
    </label>

    <label class:checked={opts.switchablePolicies}>
      <input type="checkbox" bind:checked={opts.switchablePolicies} />
      Switchable Policies
      <HelpTooltip>
        The other standard mint, burn, send and receive policies are registered as allowed alternatives, so privileged
        accounts will be able to switch the active policies after deployment. Installs the allowlist and blocklist
        managers and enables asset callbacks.
      </HelpTooltip>
    </label>
  </div>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Minimum Burn Amount
      <HelpTooltip>
        The minimum amount of tokens that must be burned at once, in whole tokens. Requires the token to be burnable by
        its holders. Privileged accounts will be able to update the minimum after deployment.
      </HelpTooltip>
    </span>
    <input
      bind:value={opts.minBurnAmount}
      use:error={errors?.minBurnAmount}
      placeholder="No minimum"
      pattern={amountPattern.source}
    />
  </label>
</section>

<RestrictionsSection bind:restrictions={opts.restrictions} />

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<InfoSection bind:info={opts.info} {errors} />
