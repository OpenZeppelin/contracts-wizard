<script lang="ts">
  import ParentExpandableSection from './ParentExpandableSection.svelte';
  import type { ComponentType } from 'svelte';

  export let label: string;
  export let checked: boolean;
  export let icon: ComponentType | undefined = undefined;

  export let helpContent: string;
  export let helpLink: string | undefined = undefined;

  export let disabled: boolean = false;
  export let disabledReason: string | undefined = undefined;

  export let required: boolean = false;

  export let error: string | undefined = undefined;
</script>

<ParentExpandableSection
  type="checkbox"
  {label}
  bind:checkboxChecked={checked}
  {icon}
  {helpContent}
  {helpLink}
  {disabled}
  {disabledReason}
  {required}
  {error}
>
  <slot />
</ParentExpandableSection>
