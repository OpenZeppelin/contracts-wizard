<script lang="ts">
  import type { OptionsErrorMessages } from '@openzeppelin/wizard-cairo';
  import type { RoyaltyInfoOptions } from '@openzeppelin/wizard-cairo/src';
  import HelpTooltip from '../common/HelpTooltip.svelte';
  import ExpandableCheckbox from '../common/ExpandableCheckbox.svelte';
  import { error } from '../common/error-tooltip';

  export let opts: RoyaltyInfoOptions;
  export let errors: undefined | OptionsErrorMessages;
</script>

<ExpandableCheckbox
  label="Royalty Info"
  bind:checked={opts.enabled}
  helpContent="Provides information for how much royalty is owed and to whom, based on a sale price. Follows ERC-2981 standard."
  helpLink="https://docs.openzeppelin.com/contracts-cairo/api/token_common#ERC2981Component"
  error={errors?.defaultRoyaltyFraction || errors?.feeDenominator}
>
  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Default Royalty Fraction
      <HelpTooltip>
        The royalty fraction that will be default for all tokens. It will be used for a token if there's no custom
        royalty fraction set for it.
      </HelpTooltip>
    </span>
    <input
      bind:value={opts.defaultRoyaltyFraction}
      use:error={errors?.defaultRoyaltyFraction}
      disabled={!opts.enabled}
    />
  </label>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Fee Denominator
      <HelpTooltip
        link="https://docs.openzeppelin.com/contracts-cairo/api/token_common#ERC2981Component-IC-FEE_DENOMINATOR"
      >
        The denominator used to interpret a token's fee and to calculate the result fee fraction.
      </HelpTooltip>
    </span>
    <input bind:value={opts.feeDenominator} use:error={errors?.feeDenominator} disabled={!opts.enabled} />
  </label>
</ExpandableCheckbox>
