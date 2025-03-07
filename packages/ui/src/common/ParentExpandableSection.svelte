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

    // For use with 'checkbox' only
    export let checked: boolean | undefined = undefined;

    // For use with 'toggleradio' only
    export let value: false | T | undefined = undefined;
    export let defaultValue: T | undefined = undefined;

    export let helpContent: string;
    export let helpLink: string | undefined;

    export let required: boolean;
    export let error: string | undefined;

    $: hasError = error !== undefined;
    
    // Keep track of expanded state separately from checkbox state
    let isExpanded = false;
    let wasRequired = required;
    
    function toggleExpanded() {
        isExpanded = !isExpanded || hasError;
    }

    $: {
        if (checked || value || hasError || (!wasRequired && required)) {
            isExpanded = true;
        }
        wasRequired = required;
    }
</script>

<section class="controls-section">
    <h1>
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="flex items-center tooltip-container pr-2">
            <!-- Button controls expansion/collapse independently -->
            <button
                on:click|preventDefault={toggleExpanded}
                class="px-1 bg-transparent border-0"
                aria-label={isExpanded ? "Collapse section" : "Expand section"}
            >
                {#if isExpanded}
                    <ChevronDown />
                {:else}
                    <ChevronRight />
                {/if}
            </button>
            <span>{label}</span>
            <span class="ml-1">
                {#if type === 'checkbox'}
                    <input
                        type="checkbox"
                        bind:checked={checked}
                        disabled={required}
                    >
                {:else if type === 'toggleradio'}
                    <ToggleRadio
                        bind:value={value}
                        {defaultValue}
                        disabled={required}
                    />
                {/if}
            </span>
            <HelpTooltip align="right" link={helpLink}>
                {helpContent}
            </HelpTooltip>
        </label>
    </h1>
    
    {#if isExpanded}
        <div class="expandable-content">
            <slot />
        </div>
    {/if}
</section>

<style>
.expandable-content {
    padding-left: 0.5rem;
    margin-top: 0.5rem;
    border-left: 2px solid #e2e8f0;
}
</style>