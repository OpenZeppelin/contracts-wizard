<script lang="ts">
  import type { Access } from '@openzeppelin/wizard-cairo';

  import ToggleRadio from '../inputs/ToggleRadio.svelte';
  import HelpTooltip from '../HelpTooltip.svelte';

  export let access: Access;
  export let required: boolean;
  let defaultValueWhenEnabled: 'ownable' | 'roles' = 'ownable';

  let wasRequired = required;
  let wasAccess = access;

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
      <HelpTooltip align="right" link="https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/Access.md">
        Restrict who can access the functions of a contract or when they can do it.
      </HelpTooltip>
    </label>
  </h1>

  <div class="checkbox-group">
    <label class:checked={access === 'ownable'}>
      <input type="radio" bind:group={access} value="ownable">
      Ownable
      <HelpTooltip link="https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/Access.md#ownable">
        Simple mechanism with a single account authorized for all privileged actions.
      </HelpTooltip>
    </label>
    <label class:checked={access === 'roles'}>
      <input type="radio" bind:group={access} value="roles">
      Roles
      <HelpTooltip link="https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/Access.md#accesscontrol">
        Flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.
      </HelpTooltip>
    </label>
  </div>

</section>
