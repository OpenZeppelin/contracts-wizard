<script lang="ts">
  import type { Access } from 'core-cairo';

  import HelpTooltip from '../HelpTooltip.svelte';

  export let access: Access;
</script>

<section class="controls-section">
  <h1>Access Control</h1>

  <div class="checkbox-group">
    <label class:checked={access === 'ownable'}>
      <input type="radio" bind:group={access} value="ownable">
      Ownable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/access#Ownable">
        Simple mechanism with a single account authorized for all privileged actions.
      </HelpTooltip>
    </label>
  </div>
</section>

