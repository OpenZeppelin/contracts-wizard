<script lang="ts">
  import type { Access } from '@openzeppelin/wizard-cairo';

  import HelpTooltip from '../common/HelpTooltip.svelte';
  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';

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

<ExpandableToggleRadio
  label="Access Control"
  bind:value={access}
  defaultValue="ownable"
  helpContent="Restrict who can access the functions of a contract or when they can do it."
  helpLink="https://docs.openzeppelin.com/contracts/api/access"
  required={required}
>
  <div class="checkbox-group">
    <label class:checked={access === 'ownable'}>
      <input type="radio" bind:group={access} value="ownable">
      Ownable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/access#Ownable">
        Simple mechanism with a single account authorized for all privileged actions.
      </HelpTooltip>
    </label>
    <label class:checked={access === 'roles'}>
      <input type="radio" bind:group={access} value="roles">
      Roles
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/access#AccessControl">
        Flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.
      </HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>