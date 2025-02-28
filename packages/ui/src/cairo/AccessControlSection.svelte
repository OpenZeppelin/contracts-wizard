<script lang="ts">
  import type { Access } from '@openzeppelin/wizard-cairo';

  import ToggleRadio from '../common/inputs/ToggleRadio.svelte';
  import HelpTooltip from '../common/HelpTooltip.svelte';

  export let access: Access = false; // Set access to false by default
  export let required: boolean;
  let defaultValueWhenEnabled: 'ownable' | 'roles' = 'ownable';

  let wasRequired = required;
  let wasAccess = access;
  let isExpanded = false; // New variable to track expanded state

  $: {
    if (wasRequired && !required) {
      access = wasAccess;
    } else {
      wasAccess = access;
      if (access === false && required) {
        access = defaultValueWhenEnabled;
      }
    }

    wasRequired = required;
    if (access !== false) {
      defaultValueWhenEnabled = access;
    }

    // Automatically expand the section if required is true
    if (required) {
      isExpanded = true;
    }
  }

  // Expand the section when a valid access type is selected
  $: if (access !== false) {
    isExpanded = true;
  }
</script>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Access Control</span>
      <span class="ml-1">
        <ToggleRadio bind:value={access} defaultValue="ownable" disabled={required} />
      </span>
      <button on:click={() => isExpanded = !isExpanded} class='mx-2 px-1'>
        {isExpanded ? '▲' : '▼'}
      </button>
      <HelpTooltip align="right" link="https://docs.openzeppelin.com/contracts-cairo/access">
        Restrict who can access the functions of a contract or when they can do it.
      </HelpTooltip>
    </label>
  </h1>

  {#if isExpanded}
  <div class="checkbox-group">
    <label class:checked={access === 'ownable'}>
      <input type="radio" bind:group={access} value="ownable">
      Ownable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/access#ownership_and_ownable">
        Simple mechanism with a single account authorized for all privileged actions.
      </HelpTooltip>
    </label>
    <label class:checked={access === 'roles'}>
      <input type="radio" bind:group={access} value="roles">
      Roles
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/access#role_based_accesscontrol">
        Flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.
      </HelpTooltip>
    </label>
  </div>
{/if}
</section>
