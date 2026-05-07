<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { FlashMintOptions, KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-cairo-alpha';
  import {
    premintPattern,
    erc20,
    flashMintDefaults,
    infoDefaults,
    macrosDefaults,
  } from '@openzeppelin/wizard-cairo-alpha';

  import AccessControlSection from './AccessControlSection.svelte';
  import UpgradeabilityField from './UpgradeabilityField.svelte';
  import InfoSection from './InfoSection.svelte';
  import MacrosSection from './MacrosSection.svelte';
  import ExpandableCheckbox from '../common/ExpandableCheckbox.svelte';
  import { error } from '../common/error-tooltip';
  import { resizeToFit } from '../common/resize-to-fit';

  export let opts: Required<KindedOptions['ERC20']> = {
    kind: 'ERC20',
    ...erc20.defaults,
    premint: '', // default to empty premint in UI instead of 0
    info: { ...infoDefaults }, // create new object since Info is nested
    macros: { ...macrosDefaults }, // create new object since MacrosOptions is nested
    access: { ...erc20.defaults.access }, // create new object since Access is nested
    flashmint: { ...flashMintDefaults }, // create new object since FlashMintOptions is nested
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = erc20.isAccessControlRequired(opts);
  $: hasPositiveFlashFee = opts.flashmint.enabled && computeHasPositiveFlashFee(opts.flashmint);

  function computeHasPositiveFlashFee(o: FlashMintOptions): boolean {
    switch (o.feeMode) {
      case 'percent':
        return parseFloat(o.feePercent || '0') > 0;
      case 'custom':
        return true;
    }
  }

  // Stash the last custom value so toggling Max → Custom restores what the user previously typed.
  let lastCustomMax: string = opts.flashmint.maxAmount === 'max' ? '0' : opts.flashmint.maxAmount;
  $: if (opts.flashmint.maxAmount !== 'max') {
    lastCustomMax = opts.flashmint.maxAmount;
  }

  function selectMaxAmountMax() {
    opts.flashmint.maxAmount = 'max';
  }
  function selectMaxAmountCustom() {
    opts.flashmint.maxAmount = lastCustomMax;
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
      <input bind:value={opts.symbol} use:error={errors?.symbol} />
    </label>
  </div>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Decimals
      <HelpTooltip>The number of decimals to use for the contract. Defaults to 18.</HelpTooltip>
    </span>
    <input bind:value={opts.decimals} use:error={errors?.decimals} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Premint
      <HelpTooltip>Create an initial amount of tokens for the recipient.</HelpTooltip>
    </span>
    <input bind:value={opts.premint} use:error={errors?.premint} placeholder="0" pattern={premintPattern.source} />
  </label>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.mintable}>
      <input type="checkbox" bind:checked={opts.mintable} />
      Mintable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/alpha/guides/erc20-supply">
        Privileged accounts will be able to create more supply.
      </HelpTooltip>
    </label>

    <label class:checked={opts.wrapper}>
      <input type="checkbox" bind:checked={opts.wrapper} />
      Wrapper
      <HelpTooltip>
        Wrap an existing ERC20 by depositing underlying tokens. The constructor requires the underlying token address
        and matching decimals.
      </HelpTooltip>
    </label>

    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable} />
      Burnable
      <HelpTooltip>Token holders will be able to destroy their tokens.</HelpTooltip>
    </label>

    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable} />
      Pausable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/alpha/security#pausable">
        Privileged accounts will be able to pause the functionality marked with <code
          >self.pausable.assert_not_paused()</code
        >. Useful for emergency response.
      </HelpTooltip>
    </label>

    <UpgradeabilityField bind:upgradeable={opts.upgradeable} />
  </div>
</section>

<ExpandableCheckbox
  label="Votes"
  bind:checked={opts.votes}
  helpContent="Keeps track of historical balances for voting in on-chain governance, with a way to delegate one's voting power to a trusted account."
  helpLink="https://docs.openzeppelin.com/contracts-cairo/alpha/governance/votes"
  error={errors?.appName || errors?.appVersion}
>
  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Application Name
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/alpha/guides/snip12">
        Name for domain separator. Prevents two applications from producing the same hash.
      </HelpTooltip>
    </span>
    <input bind:value={opts.appName} use:error={errors?.appName} disabled={!opts.votes} />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Application Version
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/alpha/guides/snip12">
        Version for domain separator. Prevents two versions of the same application from producing the same hash.
      </HelpTooltip>
    </span>
    <input bind:value={opts.appVersion} use:error={errors?.appVersion} disabled={!opts.votes} />
  </label>
</ExpandableCheckbox>

<ExpandableCheckbox
  label="Flash Mint"
  bind:checked={opts.flashmint.enabled}
  helpContent="Allow flash loans of tokens compliant with ERC-3156."
  error={errors?.flashMintMaxAmount || errors?.flashMintFeePercent}
>
  <div class="tooltip-container">
    <span class="flex justify-between items-center pr-2 mb-1">
      Max Flash Loan
      <HelpTooltip>
        Maximum amount of tokens that can be flash-loaned in a single call. <code>Max</code> inherits the default (the
        maximum representable amount minus the current total supply). <code>Custom</code> lets you set a non-negative cap;
        setting it to 0 effectively disables flash loans.
      </HelpTooltip>
    </span>
    <div class="checkbox-group">
      <label class:checked={opts.flashmint.maxAmount === 'max'}>
        <input
          type="radio"
          name="flash-mint-max-amount-mode"
          checked={opts.flashmint.maxAmount === 'max'}
          on:change={selectMaxAmountMax}
          disabled={!opts.flashmint.enabled}
        />
        Max
      </label>
      <label class:checked={opts.flashmint.maxAmount !== 'max'}>
        <input
          type="radio"
          name="flash-mint-max-amount-mode"
          checked={opts.flashmint.maxAmount !== 'max'}
          on:change={selectMaxAmountCustom}
          disabled={!opts.flashmint.enabled}
        />
        Custom
        {#if opts.flashmint.maxAmount !== 'max'}
          <input
            class="input-inline ml-auto"
            bind:value={opts.flashmint.maxAmount}
            use:error={errors?.flashMintMaxAmount}
            use:resizeToFit
            disabled={!opts.flashmint.enabled}
            pattern={premintPattern.source}
          />
        {/if}
      </label>
    </div>
  </div>

  <div class="tooltip-container">
    <span class="flex justify-between items-center pr-2 mb-1">
      Flash Fee
      <HelpTooltip>
        Fee charged for each flash loan. Choose <code>Percent</code> to charge a percentage of the loan amount, or
        <code>Custom</code> to emit a TODO stub you can fill in manually.
      </HelpTooltip>
    </span>
    <div class="checkbox-group">
      <label class:checked={opts.flashmint.feeMode === 'percent'}>
        <input type="radio" bind:group={opts.flashmint.feeMode} value="percent" disabled={!opts.flashmint.enabled} />
        Percent
        {#if opts.flashmint.feeMode === 'percent'}
          <span class="ml-auto flex items-center">
            <input
              class="input-inline"
              type="text"
              bind:value={opts.flashmint.feePercent}
              use:error={errors?.flashMintFeePercent}
              use:resizeToFit
              disabled={!opts.flashmint.enabled}
              pattern={premintPattern.source}
              placeholder="0"
            />
            <span class="ml-1">%</span>
          </span>
        {/if}
      </label>
      <label class:checked={opts.flashmint.feeMode === 'custom'}>
        <input type="radio" bind:group={opts.flashmint.feeMode} value="custom" disabled={!opts.flashmint.enabled} />
        Custom
      </label>
    </div>
  </div>

  {#if hasPositiveFlashFee}
    <div class="tooltip-container">
      <span class="flex justify-between items-center pr-2 mb-1">
        Flash Fee Destination
        <HelpTooltip>
          Where the flash loan fee goes. Burn it (default) or send it to a fee receiver address set at deploy time.
        </HelpTooltip>
      </span>
      <div class="checkbox-group">
        <label class:checked={opts.flashmint.feeDestination === 'burn'}>
          <input
            type="radio"
            bind:group={opts.flashmint.feeDestination}
            value="burn"
            disabled={!opts.flashmint.enabled}
          />
          Burn
          <HelpTooltip>The flash loan fee is sent to the zero address and effectively burnt.</HelpTooltip>
        </label>
        <label class:checked={opts.flashmint.feeDestination === 'fee_receiver'}>
          <input
            type="radio"
            bind:group={opts.flashmint.feeDestination}
            value="fee_receiver"
            disabled={!opts.flashmint.enabled}
          />
          Fee receiver
          <HelpTooltip>
            Adds a constructor argument for the fee receiver. The deployer provides the address at deployment, the
            contract validates that it is non-zero and stores it on-chain.
          </HelpTooltip>
        </label>
      </div>
    </div>
  {/if}
</ExpandableCheckbox>

<AccessControlSection
  bind:accessType={opts.access.type}
  bind:darInitialDelay={opts.access.darInitialDelay}
  bind:darDefaultDelayIncrease={opts.access.darDefaultDelayIncrease}
  bind:darMaxTransferDelay={opts.access.darMaxTransferDelay}
  required={requireAccessControl}
  {errors}
/>

<MacrosSection bind:macros={opts.macros} />

<InfoSection bind:info={opts.info} />
