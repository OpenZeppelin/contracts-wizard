<script lang="ts">
    type T = $$Generic;

    import ParentExpandableSection from './ParentExpandableSection.svelte';

    export let label: string;
    export let value: T;
    export let defaultValue: false | T;

    export let helpContent: string;
    export let helpLink: string | undefined = undefined;

    export let disabled: boolean = false;
    export let disabledReason: string | undefined = undefined;

    export let required: boolean = false;

</script>

<ParentExpandableSection type="toggleradio" {label} bind:toggleRadioValue={value} toggleRadioDefaultValue={defaultValue} {helpContent} {helpLink} {disabled} {disabledReason} {required} error={undefined}>
    <slot />
</ParentExpandableSection>