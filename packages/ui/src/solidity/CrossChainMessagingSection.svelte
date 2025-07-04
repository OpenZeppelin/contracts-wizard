<script lang="ts">
    import type { KindedOptions } from '@openzeppelin/wizard';
    import HelpTooltip from '../common/HelpTooltip.svelte';
    import ExpandableCheckbox from '../common/ExpandableCheckbox.svelte';
    import OPIcon from '../common/icons/OPIcon.svelte';
  
    export let opts: KindedOptions['Custom'];

    let crossChainMessagingEnabled = false;
    $: opts.crossChainMessaging = crossChainMessagingEnabled ? 'superchain' : false;
  </script>
  
  <ExpandableCheckbox
    label="Cross-Chain Messaging"
    icon={OPIcon}
    bind:checked={crossChainMessagingEnabled}
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
        bind:value={opts.crossChainFunctionName}
        disabled={!crossChainMessagingEnabled}
      />
    </label>
  </ExpandableCheckbox>
  