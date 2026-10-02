<script lang="ts">
  import type { Access } from '@openzeppelin/wizard-miden';

  import HelpTooltip from '../common/HelpTooltip.svelte';

  export let access: Access;
  // Whether the selected options need a faucet owner, which a Single Key faucet does not have
  export let ownerRequired: boolean;
  let defaultValueWithOwner: 'ownable' | 'roles' = 'ownable';

  let wasOwnerRequired = ownerRequired;
  let wasAccess = access;

  $: {
    if (wasOwnerRequired && !ownerRequired) {
      access = wasAccess;
    } else {
      wasAccess = access;
      if (access === 'singleKey' && ownerRequired) {
        access = defaultValueWithOwner;
      }
    }

    wasOwnerRequired = ownerRequired;
    if (access !== 'singleKey') {
      defaultValueWithOwner = access;
    }
  }
</script>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex justify-between items-center tooltip-container pr-2">
      <span>Access Control</span>
      <HelpTooltip link="https://docs.miden.xyz/protocol/account/components">
        Restrict who can mint and manage the faucet.
      </HelpTooltip>
    </label>
  </h1>

  <div class="checkbox-group">
    <label class:checked={access === 'singleKey'} class:disabled={ownerRequired}>
      <input type="radio" bind:group={access} value="singleKey" disabled={ownerRequired} />
      Single Key
      <HelpTooltip>
        One key holder signs every transaction of the faucet itself, such as minting and processing burn requests. This
        control can never be handed over or renounced, and losing the key freezes the faucet. Token transfers don't need
        the faucet's key. Can't be combined with the Owner Only burn policy.
      </HelpTooltip>
    </label>
    <label class:checked={access === 'ownable'}>
      <input type="radio" bind:group={access} value="ownable" />
      Ownable
      <HelpTooltip>
        Simple mechanism with a single owner account authorized for all privileged actions, with two-step ownership
        transfer.
      </HelpTooltip>
    </label>
    <label class:checked={access === 'roles'}>
      <input type="radio" bind:group={access} value="roles" />
      Roles
      <HelpTooltip>
        Flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.
        Minting is the exception: it is done by the faucet owner, initially the admin.
      </HelpTooltip>
    </label>
  </div>
</section>
