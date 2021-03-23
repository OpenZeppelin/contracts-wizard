<script lang="ts">
  import type { Access } from '@openzeppelin/wizard';

  import Tooltip from './Tooltip.svelte';

  export let access: Access;
</script>

<section class="controls-section">
  <h1>Access Control</h1>

  <div class="checkbox-group">
    <label class:checked={access === 'ownable'}>
      <input type="radio" bind:group={access} value="ownable">
      Ownable
      <Tooltip link="https://docs.openzeppelin.com/contracts/3.x/api/access#Ownable">
        Simple mechanism where there is a single account authorized for all privileged actions.
      </Tooltip>
    </label>
    <label class:checked={access === 'roles'}>
      <input type="radio" bind:group={access} value="roles">
      Roles
      <Tooltip link="https://docs.openzeppelin.com/contracts/3.x/api/access#AccessControl">
        Flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.
      </Tooltip>
    </label>
  </div>
</section>

