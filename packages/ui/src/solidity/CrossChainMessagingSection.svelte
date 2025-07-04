<script lang="ts">
    import HelpTooltip from '../common/HelpTooltip.svelte';
    import ExpandableCheckbox from '../common/ExpandableCheckbox.svelte';
    import OPIcon from '../common/icons/OPIcon.svelte';

    export let enabled: boolean;
    export let functionName: string;
  </script>
  
  <ExpandableCheckbox
    label="Cross-Chain Messaging"
    icon={OPIcon}
    bind:checked={enabled}
    helpContent="TODO"
    helpLink="TODO"
  >
    <label class="labeled-input">
      <span class="flex justify-between pr-2">
        Function Name
        <HelpTooltip>
          The name of the function that will be callable from another chain.
        </HelpTooltip>
      </span>
      <input
        bind:value={functionName}
        disabled={!enabled}
      />
    </label>
  </ExpandableCheckbox>
  