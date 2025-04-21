<script lang="ts">
  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import HelpTooltip from '../common/HelpTooltip.svelte';

  export let minting: boolean;
  export let mintingMode: 'sequential' | 'non_sequential';
  export let consecutive: boolean;

  let previousConsecutive = consecutive;
  let currentSelection: 'sequential' | 'non_sequential' | null = mintingMode;

  // Handle the toggle/selection state
  function handleModeChange(value: 'sequential' | 'non_sequential') {
    mintingMode = value;
    currentSelection = value;
    if (!minting) {
      minting = true;
    }
  }

  // Watch for consecutive changes
  $: if (consecutive !== previousConsecutive && consecutive) {
    // If consecutive was just enabled, clear selection
    currentSelection = null;
    minting = false;
  }

  $: previousConsecutive = consecutive;
</script>

<ExpandableToggleRadio
  label="Minting"
  bind:value={minting}
  defaultValue={true}
  helpContent="Configure minting mode for NFTs."
  disabled={consecutive}
>
  <div class="checkbox-group">
    <label class:checked={currentSelection === 'sequential'}>
      <input
        type="radio"
        name="minting-mode"
        value="sequential"
        checked={currentSelection === 'sequential' && !consecutive}
        on:change={() => handleModeChange('sequential')}
        disabled={consecutive}
      />
      Sequential
      <HelpTooltip>Tokens will be minted with sequential IDs.</HelpTooltip>
    </label>

    <label class:checked={currentSelection === 'non_sequential'}>
      <input
        type="radio"
        name="minting-mode"
        value="non_sequential"
        checked={currentSelection === 'non_sequential' && !consecutive}
        on:change={() => handleModeChange('non_sequential')}
        disabled={consecutive}
      />
      Non-Sequential
      <HelpTooltip>Tokens can be minted with arbitrary IDs.</HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>
