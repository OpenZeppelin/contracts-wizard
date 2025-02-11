<script lang="ts">
  export let requestedVersion: string;
  export let compatibleVersionSemver: string;
</script>

<div class="container flex flex-col gap-4 p-4">
  <div class="header flex justify-between items-center">
    <h1 class="text-lg font-bold">Unsupported Version</h1>
  </div>

  <div class="controls p-4">
    <p>
      Version <strong>{requestedVersion}</strong> is not supported by the Wizard.
    </p>
    <p>
      Select a version that is compatible with the version range: <strong>{compatibleVersionSemver}</strong>.
    </p>
  </div>
</div>

<style lang="postcss">
  .container {
    background-color: var(--gray-1);
    border: 1px solid var(--gray-2);
    border-radius: 10px;
    min-width: 32rem;
  }

  .header {
    font-size: var(--text-small);
  }

  .controls {
    background-color: white;
    padding: var(--size-4);
    border-radius: 5px;
    box-shadow: var(--shadow);
  }
</style>
