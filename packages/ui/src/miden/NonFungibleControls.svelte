<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-miden';
  import { nonFungible, infoDefaults, symbolPattern } from '@openzeppelin/wizard-miden';

  import AccessControlSection from './AccessControlSection.svelte';
  import InfoSection from './InfoSection.svelte';
  import RestrictionsSection from './RestrictionsSection.svelte';
  import { error } from '../common/error-tooltip';

  export let opts: Required<KindedOptions['NonFungible']> = {
    kind: 'NonFungible',
    ...nonFungible.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = nonFungible.isAccessControlRequired(opts);
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
</section>

<section class="controls-section">
  <h1>Metadata</h1>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Description
      <HelpTooltip>An optional description of the collection, at most 195 bytes.</HelpTooltip>
    </span>
    <input bind:value={opts.description} use:error={errors?.description} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Logo URI
      <HelpTooltip>An optional URI of the collection logo, at most 195 bytes.</HelpTooltip>
    </span>
    <input bind:value={opts.logoUri} placeholder="https://..." use:error={errors?.logoUri} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Contract URI
      <HelpTooltip>An optional URI of the collection-level metadata, at most 195 bytes.</HelpTooltip>
    </span>
    <input bind:value={opts.contractUri} placeholder="https://..." use:error={errors?.contractUri} />
  </label>

  <div class="checkbox-group">
    <label class:checked={opts.updatableMetadata}>
      <input type="checkbox" bind:checked={opts.updatableMetadata} />
      Updatable Metadata
      <HelpTooltip>
        Privileged accounts will be able to update the description, logo URI and contract URI after deployment.
      </HelpTooltip>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable} />
      Burnable
      <HelpTooltip>
        Any holder will be able to burn their NFTs by sending them back to the faucet in a BURN note. Otherwise only the
        owner can burn, which requires access control.
      </HelpTooltip>
    </label>

    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable} />
      Pausable
      <HelpTooltip>
        Privileged accounts will be able to pause minting, burning and metadata updates, and also transfers when an
        allowlist or blocklist is active. Unrestricted transfers are never checked against the faucet. Useful for
        emergency response.
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
</section>

<RestrictionsSection bind:restrictions={opts.restrictions} />

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<InfoSection bind:info={opts.info} {errors} />
