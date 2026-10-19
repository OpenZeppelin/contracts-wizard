<script lang="ts">
  import type { Access } from '@openzeppelin/wizard';

  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import HelpTooltip from '../common/HelpTooltip.svelte';
  import { error as errorTooltip } from '../common/error-tooltip';

  export let access: Access;
  export let required: boolean;
  export let error: string | undefined = undefined;
  export let defaultValueWhenEnabled: 'ownable' | 'roles' | 'managed' = 'ownable';
  export let disableOwnable = false;
  export let disableManaged = false;

  let wasRequired = required;
  let wasAccess = access;

  function choose(value: 'ownable' | 'roles' | 'managed') {
    wasAccess = value;
  }

  $: {
    if (wasRequired && !required) {
      // No feature needs Access Control anymore: go back to what it was, including off.
      access = wasAccess;
    } else if (!required) {
      // Access Control is optional: remember the current selection.
      wasAccess = access;
    } else if (access === false) {
      // A feature needs Access Control and it is off: turn it on to the passed-in default value.
      access = defaultValueWhenEnabled;
    }

    wasRequired = required;
  }
</script>

<ExpandableToggleRadio
  label="Access Control"
  bind:value={access}
  defaultValue="ownable"
  helpContent="Restrict who can access the functions of a contract or when they can do it."
  helpLink="https://docs.openzeppelin.com/contracts/5.x/api/access"
  {required}
>
  <div class="checkbox-group">
    <label class:checked={access === 'ownable'} use:errorTooltip={access === 'ownable' ? error : undefined}>
      <input
        type="radio"
        bind:group={access}
        value="ownable"
        disabled={disableOwnable}
        on:click={() => choose('ownable')}
      />
      Ownable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/access#Ownable">
        Simple mechanism with a single account authorized for all privileged actions.
      </HelpTooltip>
    </label>
    <label class:checked={access === 'roles'} use:errorTooltip={access === 'roles' ? error : undefined}>
      <input type="radio" bind:group={access} value="roles" on:click={() => choose('roles')} />
      Roles
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/access#AccessControl">
        Flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.
      </HelpTooltip>
    </label>
    <label class:checked={access === 'managed'} use:errorTooltip={access === 'managed' ? error : undefined}>
      <input
        type="radio"
        bind:group={access}
        value="managed"
        disabled={disableManaged}
        on:click={() => choose('managed')}
      />
      Managed
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/access#AccessManaged">
        Enables a central contract to define a policy that allows certain callers to access certain functions.
      </HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>
