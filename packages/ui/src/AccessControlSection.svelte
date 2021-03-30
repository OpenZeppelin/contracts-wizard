<script lang="ts">
  import type { Access } from '@openzeppelin/wizard';

  import HelpTooltip from './HelpTooltip.svelte';

  export let access: Access;
</script>

<section class="controls-section">
  <h1>Access Control</h1>

  <div class="checkbox-group">
    <label class:checked={access === 'ownable'}>
      <input type="radio" bind:group={access} value="ownable">
      Ownable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/3.x/api/access#Ownable">
        Simple mechanism with a single account authorized for all privileged actions.
      </HelpTooltip>
    </label>
    <label class:checked={access === 'roles'}>
      <input type="radio" bind:group={access} value="roles">
      Roles
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/3.x/api/access#AccessControl">
        Flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.
      </HelpTooltip>
    </label>
  </div>
</section>

