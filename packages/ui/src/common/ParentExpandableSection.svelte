<script lang="ts">
  /**
   * Parent component for sections that can be expanded/collapsed.
   * Not intended to be used directly -- use ExpandableCheckbox and ExpandableToggleRadio instead.
   */

  type T = $$Generic;

  import ToggleRadio from './inputs/ToggleRadio.svelte';
  import HelpTooltip from './HelpTooltip.svelte';

  import ChevronRight from './icons/ChevronRight.svelte';
  import ChevronDown from './icons/ChevronDown.svelte';

  export let label: string;
  export let type: 'checkbox' | 'toggleradio';

  export let checkboxChecked: boolean | undefined = undefined;

  export let toggleRadioValue: false | T | undefined = undefined;
  export let toggleRadioDefaultValue: T | undefined = undefined;

  export let helpContent: string;
  export let helpLink: string | undefined;

  // Whether the section is disabled, and optionally the reason why
  export let disabled: boolean;
  export let disabledReason: string | undefined;

  // Whether the section is required.
  // Similar to `disabled`, but expands by default and does not show a reason.
  export let required: boolean;

  export let error: string | undefined;

  $: hasError = error !== undefined;

  // Keep track of expanded state separately from checkbox state
  let isExpanded = false;
  let wasRequired = required;

  $: isCheckboxSelected = !!(checkboxChecked || toggleRadioValue);
  let wasCheckboxSelected = isCheckboxSelected;

  function toggleExpanded() {
    isExpanded = !isExpanded || hasError;
  }

  $: {
    if (hasError || (!wasCheckboxSelected && isCheckboxSelected) || (!wasRequired && required)) {
      isExpanded = true;
    }
    wasRequired = required;
    wasCheckboxSelected = isCheckboxSelected;
  }
</script>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="items-center tooltip-container pr-2 flex justify-between">
      <div class="flex items-center">
        <span class="mr-2">
          {#if type === 'checkbox'}
            <input type="checkbox" bind:checked={checkboxChecked} disabled={disabled || required} />
          {:else if type === 'toggleradio'}
            <ToggleRadio
              bind:value={toggleRadioValue}
              defaultValue={toggleRadioDefaultValue}
              disabled={disabled || required}
            />
          {/if}
        </span>
        <span>{label}</span>
      </div>
      <div class="flex items-center">
        <button
          on:click|preventDefault={toggleExpanded}
          class="px-1 bg-transparent border-0 mr-2"
          aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
        >
          {#if isExpanded}
            <ChevronDown />
          {:else}
            <ChevronRight />
          {/if}
        </button>
        <HelpTooltip link={helpLink}>
          {@html helpContent}
        </HelpTooltip>
      </div>
    </label>
  </h1>

  <div class="text-sm text-gray-500" hidden={!disabled || disabledReason === undefined}>
    <span class="italic">{disabledReason}</span>
  </div>

  <div hidden={!isExpanded}>
    <slot />
  </div>
</section>
