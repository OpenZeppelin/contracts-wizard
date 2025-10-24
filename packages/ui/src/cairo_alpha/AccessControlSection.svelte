<script lang="ts">
  import type { AccessType, OptionsErrorMessages } from '@openzeppelin/wizard-cairo-alpha';

  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import HelpTooltip from '../common/HelpTooltip.svelte';
  import { error } from '../common/error-tooltip';

  export let accessType: AccessType;
  export let darInitialDelay: string;
  export let darDefaultDelayIncrease: string;
  export let required: boolean;
  export let errors: undefined | OptionsErrorMessages;

  let defaultTypeWhenEnabled: 'ownable' | 'roles' | 'roles-dar' = 'ownable';
  let wasRequired = required;
  let wasAccessType = accessType;

  $: {
    if (wasRequired && !required) {
      accessType = wasAccessType;
    } else {
      wasAccessType = accessType;
      if (accessType === false && required) {
        accessType = defaultTypeWhenEnabled;
      }
    }

    wasRequired = required;
    if (accessType !== false) {
      defaultTypeWhenEnabled = accessType;
    }
  }
</script>

<ExpandableToggleRadio
  label="Access Control"
  bind:value={accessType}
  defaultValue="ownable"
  helpContent="Restrict who can access the functions of a contract or when they can do it."
  helpLink="https://docs.openzeppelin.com/contracts-cairo/alpha/access"
  {required}
>
  <div class="checkbox-group">
    <label class:checked={accessType === 'ownable'}>
      <input type="radio" bind:group={accessType} value="ownable" />
      Ownable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/alpha/access#ownership-and-ownable">
        Simple mechanism with a single account authorized for all privileged actions.
      </HelpTooltip>
    </label>
    <label class:checked={accessType === 'roles'}>
      <input type="radio" bind:group={accessType} value="roles" />
      Roles
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/alpha/access#role-based-accesscontrol">
        Flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.
      </HelpTooltip>
    </label>
    <label class:checked={accessType === 'roles-dar'}>
      <input type="radio" bind:group={accessType} value="roles-dar" />
      Roles (Default Admin Rules)
      <HelpTooltip
        link="https://docs.openzeppelin.com/contracts-cairo/alpha/api/access#AccessControlDefaultAdminRulesComponent"
      >
        Provides additional enforced security measures on top of standard Roles mechanism for managing the most
        privileged role: default admin.
      </HelpTooltip>
    </label>
  </div>
  {#if accessType === 'roles-dar'}
    <label class="labeled-input">
      <span class="flex justify-between pr-2">
        Initial delay
        <HelpTooltip>The initial delay before the default admin can be assigned.</HelpTooltip>
      </span>
      <input bind:value={darInitialDelay} placeholder="" use:error={errors?.darInitialDelay} />
    </label>
    <label class="labeled-input">
      <span class="flex justify-between pr-2">
        Default admin delay increase
        <HelpTooltip>The duration by which the delay for the default admin increases after each assignment.</HelpTooltip
        >
      </span>
      <input bind:value={darDefaultDelayIncrease} placeholder="" use:error={errors?.darDefaultDelayIncrease} />
    </label>
  {/if}
</ExpandableToggleRadio>
