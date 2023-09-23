<script lang="ts">
  type T = $$Generic;

  export let value: false | T = false;
  export let checked = value !== false;
  export let defaultValue: T;
  export let disabled: boolean | undefined = undefined;

  let wasChecked = checked;
  let wasValue = value || defaultValue;

  $: {
    if (!wasChecked) {
      if (checked) {
        value = wasValue;
      } else if (value !== false) {
        checked = true;
      }
    } else if (!checked) {
      value = false;
    } else if (value === false) {
      checked = false;
    }

    wasChecked = checked;
    wasValue = value || wasValue;
  }
</script>

<input type="checkbox" bind:checked {disabled}>
