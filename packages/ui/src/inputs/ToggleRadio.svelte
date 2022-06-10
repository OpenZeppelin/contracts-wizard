<script lang="ts">
  import { error } from "../error-tooltip";

  export let value: false | string = false;
  export let enabled = value !== false;
  export let defaultValue: string;

  let wasEnabled = enabled;
  let wasValue = value || defaultValue;

  $: {
    if (!wasEnabled) {
      if (enabled) {
        value = wasValue;
      } else if (value !== false) {
        enabled = true;
      }
    } else if (!enabled) {
      value = false;
    }

    wasEnabled = enabled;
    wasValue = value || wasValue;
  }

  export let errorMessage: string | undefined = undefined;
</script>

<input type="checkbox" bind:checked={enabled} use:error={errorMessage}>
