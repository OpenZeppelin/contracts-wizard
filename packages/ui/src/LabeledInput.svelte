<script lang="ts">
  export let label;
  export let value = undefined;
</script>

<label>
  <span class="label">{label}</span>
  <input bind:value {...$$restProps}>
</label>

<style>
  label {
    display: block;
  }

  .label {
    display: block;
    margin-bottom: .25em;
    font-size: .9em;
  }

  input {
    display: block;
    width: 100%;
  }
</style>
