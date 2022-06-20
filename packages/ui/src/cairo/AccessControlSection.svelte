<script lang="ts">
  import type { Access } from '@openzeppelin/wizard-cairo';

  import ToggleRadio from '../inputs/ToggleRadio.svelte';
  import HelpTooltip from '../HelpTooltip.svelte';

  export let access: Access;
  export let requireAccessControl: boolean;

  $: {
    if (access === false && requireAccessControl) {
      access = 'ownable';
    }
  }
</script>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Access Control</span>
      <span class="ml-1">
        <ToggleRadio bind:value={access} defaultValue="ownable" disabled={requireAccessControl} />
      </span>
      <HelpTooltip align="right" link="https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/Access.md">
        Restrict who can access the functions of a contract or when they can do it.
      </HelpTooltip>
    </label>
  </h1>
</section>
