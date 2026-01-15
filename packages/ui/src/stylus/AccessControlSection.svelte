<script lang="ts">
  import type { Access } from '@openzeppelin/wizard-stylus';

  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import HelpTooltip from '../common/HelpTooltip.svelte';

  export let access: Access;
  export let required: boolean;
  let defaultValueWhenEnabled: 'roles' | 'ownable' = 'ownable';

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

<ExpandableToggleRadio
  label="Access Control"
  bind:value={access}
  defaultValue="ownable"
  helpContent="Restrict who can access the functions of a contract or when they can do it."
  {required}
>
  <div class="checkbox-group">
    <label class:checked={access === 'ownable'}>
      <input type="radio" bind:group={access} value="ownable" />
      Ownable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-stylus/access-control#ownership-and-ownable">
        Simple mechanism with a single account authorized for all privileged actions.
      </HelpTooltip>
    </label>
    <label class:checked={access === 'roles'}>
      <input type="radio" bind:group={access} value="roles" />
      Roles
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-stylus/access-control#role-based-access-control">
        Flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.
      </HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>
