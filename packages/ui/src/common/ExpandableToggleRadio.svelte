<script lang="ts">
    type T = $$Generic;

    import ParentExpandableSection from './ParentExpandableSection.svelte';

    export let label: string;
    export let value: T;
    export let defaultValue: false | T;

    export let helpContent: string;
    export let helpLink: string | undefined = undefined;

    export let required: boolean = false;
    export let error: string | undefined = undefined;

</script>

<ParentExpandableSection type="toggleradio" {label} bind:value={value} {defaultValue} {helpContent} {helpLink} {required} {error}>
    <slot />
</ParentExpandableSection>