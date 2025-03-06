<!-- ExpandableSection.svelte -->
<script lang="ts">
    import ToggleRadio from '../common/inputs/ToggleRadio.svelte';
    import HelpTooltip from '../common/HelpTooltip.svelte';

    import ChevronRight from './icons/ChevronRight.svelte';
    import ChevronDown from './icons/ChevronDown.svelte';
    
    export let label: string;
    export let type: 'checkbox' | 'toggleradio' = 'checkbox';
    export let checked: boolean | undefined = undefined;
    export let value: string | undefined = undefined;
    export let defaultValue: string | undefined = undefined;
    export let helpContent: string;
    export let helpLink: string;
    export let required = false;
    export let hasError: boolean;
    
    // Keep track of expanded state separately from checkbox state
    let isExpanded = false;
    let wasRequired = required;
    
    function toggleExpanded() {
        isExpanded = hasError || !isExpanded;
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
        padding-left: 1.5rem;
        margin-top: 0.5rem;
        border-left: 2px solid #e2e8f0;
    }
    </style>