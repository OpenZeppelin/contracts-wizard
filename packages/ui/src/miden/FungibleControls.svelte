<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-miden';
  import { amountPattern, fungible, infoDefaults, symbolPattern } from '@openzeppelin/wizard-miden';

  import AccessControlSection from './AccessControlSection.svelte';
  import InfoSection from './InfoSection.svelte';
  import TransferPolicySection from './TransferPolicySection.svelte';
  import { error } from '../common/error-tooltip';
  import { resizeToFit } from '../common/resize-to-fit';

  export let opts: Required<KindedOptions['Fungible']> = {
    kind: 'Fungible',
    ...fungible.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  $: ownerRequired = fungible.isAccessControlRequired(opts);

  // A transfer policy makes pausing stop transfers in any case
  $: hasTransferPolicy = opts.transferPolicy === 'allowlist' || opts.transferPolicy === 'blocklist';
  $: pausesTransfers = opts.pausable && (opts.pausableTransfers || hasTransferPolicy);
  $: transfersAlwaysPaused = opts.pausable && hasTransferPolicy;

  let wasPausable = opts.pausable;
  let wasPausableTransfers = opts.pausableTransfers;
  let wasBurnPolicy = opts.burnPolicy;
  let otherBurnPolicyMinBurnAmount = '';

  $: {
    if (wasPausable && !opts.pausable) {
      opts.pausableTransfers = false;
    }

    if (opts.pausableTransfers && !wasPausableTransfers) {
      opts.pausable = true;
    }

    // The minimum only applies to the Minimum Amount burn policy, so keep it aside while another policy is selected
    if (opts.burnPolicy !== 'minimumAmount' && opts.minBurnAmount !== '') {
      otherBurnPolicyMinBurnAmount = opts.minBurnAmount;
      opts.minBurnAmount = '';
    } else if (wasBurnPolicy !== 'minimumAmount' && opts.burnPolicy === 'minimumAmount' && opts.minBurnAmount === '') {
      opts.minBurnAmount = otherBurnPolicyMinBurnAmount;
    }

    wasPausable = opts.pausable;
    wasPausableTransfers = opts.pausableTransfers;
    wasBurnPolicy = opts.burnPolicy;
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

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Decimals
      <HelpTooltip
        >The number of decimals used to represent token amounts. Defaults to 8, with a maximum of 12.</HelpTooltip
      >
    </span>
    <input bind:value={opts.decimals} use:error={errors?.decimals} placeholder={fungible.defaults.decimals} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Max Supply
      <HelpTooltip>
        The maximum number of tokens in circulation at any time. Burning frees room to mint again.
      </HelpTooltip>
    </span>
    <input bind:value={opts.maxSupply} use:error={errors?.maxSupply} pattern={amountPattern.source} />
  </label>

  <div class="checkbox-group">
    <label class:checked={opts.updatableMaxSupply}>
      <input type="checkbox" bind:checked={opts.updatableMaxSupply} />
      Updatable Max Supply
      <HelpTooltip>Privileged accounts will be able to update the maximum supply after deployment.</HelpTooltip>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>Metadata</h1>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Description
      <HelpTooltip>An optional description of the token.</HelpTooltip>
    </span>
    <input bind:value={opts.description} use:error={errors?.description} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Logo URI
      <HelpTooltip>An optional URI of the token logo.</HelpTooltip>
    </span>
    <input bind:value={opts.logoUri} placeholder="https://..." use:error={errors?.logoUri} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      External Link
      <HelpTooltip>An optional link to more information about the token.</HelpTooltip>
    </span>
    <input bind:value={opts.externalLink} placeholder="https://..." use:error={errors?.externalLink} />
  </label>

  <div class="checkbox-group">
    <label class:checked={opts.updatableMetadata}>
      <input type="checkbox" bind:checked={opts.updatableMetadata} />
      Updatable Description and URIs
      <HelpTooltip>
        Privileged accounts will be able to update the description, logo URI and external link after deployment. The
        name, symbol and decimals can never change.
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
        Privileged accounts will be able to pause minting, burning, and updates to the metadata and max supply. Useful
        for emergency response.
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
        burning, and updates to the metadata and max supply. Transfers are always included when a transfer policy is
        set.
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

<TransferPolicySection bind:transferPolicy={opts.transferPolicy} asset="the token" />

<section class="controls-section">
  <h1>Burn Policy</h1>

  <div class="checkbox-group">
    <label class:checked={opts.burnPolicy === 'anyHolder'}>
      <input type="radio" bind:group={opts.burnPolicy} value="anyHolder" />
      Any Holder
      <HelpTooltip>Token holders will be able to destroy their tokens.</HelpTooltip>
    </label>

    <label class:checked={opts.burnPolicy === 'minimumAmount'}>
      <input type="radio" bind:group={opts.burnPolicy} value="minimumAmount" />
      Minimum Amount
      <HelpTooltip>
        Token holders will be able to destroy their tokens, at least this many at a time. Privileged accounts can change
        the minimum after deployment. Tokens in a smaller burn request stay locked until the faucet accepts the request,
        which requires lowering the minimum first.
      </HelpTooltip>
    </label>

    {#if opts.burnPolicy === 'minimumAmount'}
      <p class="subcontrol tooltip-container flex justify-between items-center pr-2">
        <label class="text-sm flex-1">
          &nbsp;Amount:
          <input
            bind:value={opts.minBurnAmount}
            pattern={amountPattern.source}
            class="input-inline"
            use:resizeToFit
            use:error={errors?.minBurnAmount}
          />
        </label>
      </p>
    {/if}

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
