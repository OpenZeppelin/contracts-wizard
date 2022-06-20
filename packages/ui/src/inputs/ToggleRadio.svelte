<script lang="ts">
  export let value: false | string = false;
  export let checked = value !== false;
  export let defaultValue: string;
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
    }

    wasChecked = checked;
    wasValue = value || wasValue;
  }
</script>

<input type="checkbox" bind:checked={checked} disabled={disabled}>