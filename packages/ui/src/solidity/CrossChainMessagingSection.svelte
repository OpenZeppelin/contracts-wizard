<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';
  import ExpandableCheckbox from '../common/ExpandableCheckbox.svelte';
  import OPIcon from '../common/icons/OPIcon.svelte';
  import { error } from '../common/error-tooltip';
  import type { OptionsErrorMessages, CrossChainMessaging } from '@openzeppelin/wizard';

  export let mode: CrossChainMessaging;
  export let functionName: string;
  export let errors: undefined | OptionsErrorMessages;

  // Show notice when enabled
  import { superchainGenericTooltipProps } from './superchain-tooltip';
  import tippy, { type Instance as TippyInstance } from 'tippy.js';
  import { onMount } from 'svelte';

  let crosschainLabel: HTMLElement;
  let crosschainTooltip: TippyInstance;
  onMount(() => {
    crosschainTooltip = tippy(crosschainLabel, superchainGenericTooltipProps);
  });

  $: enabled = mode === 'superchain';

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    mode = target.checked ? 'superchain' : false;
  }

  let wasEnabled = false;
  $: {
    if (!wasEnabled && enabled) {
      crosschainTooltip.show();
    }
    wasEnabled = enabled;
  }
</script>

<ExpandableCheckbox
  label="Cross-Chain Messaging"
  icon={OPIcon}
  checked={enabled}
  on:change={handleChange}
  helpContent="Adds an example for Superchain interop message passing."
  helpLink="https://docs.optimism.io/interop/message-passing"
  error={errors?.crossChainFunctionName}
>
  <label bind:this={crosschainLabel} class="labeled-input">
    <span class="flex justify-between pr-2">
      Function Name
      <HelpTooltip>The name of a custom function that will be callable from another chain.</HelpTooltip>
    </span>
    <input bind:value={functionName} use:error={errors?.crossChainFunctionName} disabled={!enabled} />
  </label>
</ExpandableCheckbox>
