<script lang="ts">
  import ParentExpandableSection from './ParentExpandableSection.svelte';

  export let label: string;
  export let checked: boolean;

  export let helpContent: string;
  export let helpLink: string | undefined = undefined;

  export let disabled: boolean = false;
  export let disabledReason: string | undefined = undefined;

  export let required: boolean = false;

  export let error: string | undefined = undefined;
</script>

<ParentExpandableSection
  type="section"
  {label}
  bind:checkboxChecked={checked}
  {helpContent}
  {helpLink}
  {disabled}
  {disabledReason}
  {required}
  {error}
>
  <slot />
</ParentExpandableSection>
