<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-miden';
  import { nonFungible, infoDefaults, symbolPattern } from '@openzeppelin/wizard-miden';

  import AccessControlSection from './AccessControlSection.svelte';
  import InfoSection from './InfoSection.svelte';
  import TransferPolicySection from './TransferPolicySection.svelte';
  import { error } from '../common/error-tooltip';

  export let opts: Required<KindedOptions['NonFungible']> = {
    kind: 'NonFungible',
    ...nonFungible.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  $: ownerRequired = nonFungible.isAccessControlRequired(opts);

  // A transfer policy makes pausing stop transfers in any case
  $: hasTransferPolicy = opts.transferPolicy === 'allowlist' || opts.transferPolicy === 'blocklist';
  $: pausesTransfers = opts.pausable && (opts.pausableTransfers || hasTransferPolicy);
  $: transfersAlwaysPaused = opts.pausable && hasTransferPolicy;

  let wasPausable = opts.pausable;
  let wasPausableTransfers = opts.pausableTransfers;

  $: {
    if (wasPausable && !opts.pausable) {
      opts.pausableTransfers = false;
    }

    if (opts.pausableTransfers && !wasPausableTransfers) {
      opts.pausable = true;
    }

    wasPausable = opts.pausable;
    wasPausableTransfers = opts.pausableTransfers;
  }
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
      <HelpTooltip>An optional description of the collection.</HelpTooltip>
    </span>
    <input bind:value={opts.description} use:error={errors?.description} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Logo URI
      <HelpTooltip>An optional URI of the collection logo.</HelpTooltip>
    </span>
    <input bind:value={opts.logoUri} placeholder="https://..." use:error={errors?.logoUri} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Contract URI
      <HelpTooltip>An optional URI of the collection-level metadata.</HelpTooltip>
    </span>
    <input bind:value={opts.contractUri} placeholder="https://..." use:error={errors?.contractUri} />
  </label>

  <div class="checkbox-group">
    <label class:checked={opts.updatableMetadata}>
      <input type="checkbox" bind:checked={opts.updatableMetadata} />
      Updatable Description and URIs
      <HelpTooltip>
        Privileged accounts will be able to update the description, logo URI and contract URI after deployment. The name
        and symbol can never change.
      </HelpTooltip>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable} />
      Pausable
      <HelpTooltip>
        Privileged accounts will be able to pause minting, burning and metadata updates. Useful for emergency response.
      </HelpTooltip>
    </label>

    <label class:checked={pausesTransfers} class="subcontrol">
      <input
        type="checkbox"
        checked={pausesTransfers}
        disabled={transfersAlwaysPaused}
        on:change={e => (opts.pausableTransfers = e.currentTarget.checked)}
      />
      Include Transfers
      <HelpTooltip>
        Pausing also stops transfers. Every transfer then consults the faucet, so transfers cost more to prove and must
        reach the chain within about a minute. This extra cost is permanent. If unchecked, pausing stops only minting,
        burning and metadata updates. Transfers are always included when a transfer policy is set.
      </HelpTooltip>
    </label>

    <label class:checked={opts.switchableTransferPolicy}>
      <input type="checkbox" bind:checked={opts.switchableTransferPolicy} />
      Switchable Transfer Policy
      <HelpTooltip>
        Privileged accounts will be able to turn on an allowlist or blocklist after deployment, and switch between them,
        which can freeze transfers. Every transfer then consults the faucet, so transfers cost more to prove. This extra
        cost is permanent.
      </HelpTooltip>
    </label>
  </div>
</section>

<TransferPolicySection bind:transferPolicy={opts.transferPolicy} asset="tokens" />

<section class="controls-section">
  <h1>Burn Policy</h1>

  <div class="checkbox-group">
    <label class:checked={opts.burnPolicy === 'anyHolder'}>
      <input type="radio" bind:group={opts.burnPolicy} value="anyHolder" />
      Any Holder
      <HelpTooltip>Token holders will be able to destroy their tokens.</HelpTooltip>
    </label>

    <label class:checked={opts.burnPolicy === 'ownerOnly'}>
      <input type="radio" bind:group={opts.burnPolicy} value="ownerOnly" />
      Owner Only
      <HelpTooltip>
        Only the faucet owner can destroy the tokens it holds, and tokens that other holders try to destroy are
        permanently locked instead.
      </HelpTooltip>
    </label>
  </div>
</section>

<AccessControlSection bind:access={opts.access} {ownerRequired} />

<InfoSection bind:info={opts.info} {errors} />
