<script lang="ts">
  import type { HooksOptions, SharesConfig } from '@openzeppelin/wizard-uniswap-hooks/src';
  import { specificSharesType } from '@openzeppelin/wizard-uniswap-hooks/src';

  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import HelpTooltip from '../common/HelpTooltip.svelte';

  export let opts: HooksOptions;
  export let sharesConfig: SharesConfig;

  $: disabled = sharesConfig === 'required' || sharesConfig === 'disabled' || specificSharesType(sharesConfig);

  $: disabledReason =
    sharesConfig === 'required'
      ? `Shares are required by <code>${opts.hook}</code>`
      : sharesConfig === 'disabled'
        ? `Shares are disabled for <code>${opts.hook}</code>`
        : specificSharesType(sharesConfig)
          ? `${sharesConfig} Shares are required for <code>${opts.hook}</code>`
          : undefined;

  $: isERC20Disabled = sharesConfig === 'disabled' || (specificSharesType(sharesConfig) && 'ERC20' !== sharesConfig);
  $: isERC1155Disabled =
    sharesConfig === 'disabled' || (specificSharesType(sharesConfig) && 'ERC1155' !== sharesConfig);
  $: isERC6909Disabled =
    sharesConfig === 'disabled' || (specificSharesType(sharesConfig) && 'ERC6909' !== sharesConfig);
</script>

<ExpandableToggleRadio
  label="Shares"
  bind:value={opts.shares.options}
  {disabled}
  {disabledReason}
  defaultValue="ERC20"
  helpContent={'Shares are useful to account for the ownership of a portion of a liquidity position or pending credit.'}
  helpLink="https://docs.openzeppelin.com/contracts/5.x/api/token/erc20"
>
  <div class="checkbox-group">
    <label class:checked={opts.shares.options === 'ERC20'}>
      <input type="radio" bind:group={opts.shares.options} value="ERC20" disabled={isERC20Disabled} />
      ERC-20
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/token/erc20">
        ERC-20 shares are useful for single-token accounting.
      </HelpTooltip>
    </label>

    <label class:checked={opts.shares.options === 'ERC1155'}>
      <input type="radio" bind:group={opts.shares.options} value="ERC1155" disabled={isERC1155Disabled} />
      ERC-1155
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/token/erc1155">
        ERC-1155 shares are useful for multi-token accounting.
      </HelpTooltip>
    </label>

    <label class:checked={opts.shares.options === 'ERC6909'}>
      <input type="radio" bind:group={opts.shares.options} value="ERC6909" disabled={isERC6909Disabled} />
      ERC-6909
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/token/erc6909">
        ERC-6909 shares are useful for optimized multi-token accounting.
      </HelpTooltip>
    </label>
  </div>

  <div style="height: 0.5rem;"></div>

  {#if opts.shares.options === 'ERC1155'}
    <label class="labeled-input">
      <span>URI</span>
      <input bind:value={opts.shares.uri} />
    </label>
  {/if}

  {#if opts.shares.options === 'ERC20'}
    <div class="grid grid-cols-[2fr,1fr] gap-2">
      <label class="labeled-input">
        <span>Name</span>
        <input bind:value={opts.shares.name} />
      </label>

      <label class="labeled-input">
        <span>Symbol</span>
        <input bind:value={opts.shares.symbol} />
      </label>
    </div>
  {/if}
</ExpandableToggleRadio>
