<script lang="ts">
    import HelpTooltip from '../common/HelpTooltip.svelte';
    import ExpandableCheckbox from '../common/ExpandableCheckbox.svelte';
    import OPIcon from '../common/icons/OPIcon.svelte';
    import { error } from '../common/error-tooltip';
    import type { OptionsErrorMessages } from '@openzeppelin/wizard';

    export let enabled: boolean;
    export let functionName: string;
    export let errors: undefined | OptionsErrorMessages;
  </script>
  
  <ExpandableCheckbox
    label="Cross-Chain Messaging"
    icon={OPIcon}
    bind:checked={enabled}
    helpContent="TODO"
    helpLink="TODO"
    error={errors?.crossChainFunctionName}
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
        use:error={errors?.crossChainFunctionName}
        disabled={!enabled}
      />
    </label>
  </ExpandableCheckbox>
  