<script lang="ts">
  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import HelpTooltip from '../common/HelpTooltip.svelte';

  export let mintable: boolean;
  export let sequential: boolean;
  export let consecutive: boolean;

  let previousConsecutive = consecutive;
  function handleSequentialChange(value: boolean) {
    sequential = value;
    if (!mintable) {
      mintable = true;
    }
  }

  $: if (consecutive !== previousConsecutive && consecutive) {
    sequential = false;
    mintable = false;
  }

  $: previousConsecutive = consecutive;
</script>

<ExpandableToggleRadio
  label="Minting"
  bind:value={mintable}
  defaultValue={true}
  helpContent="Configure minting mode for NFTs."
  disabled={consecutive}
>
  <div class="checkbox-group">
    <label class:checked={sequential}>
      <input
        type="radio"
        name="minting-mode"
        value="sequential"
        checked={sequential && !consecutive}
        on:change={() => handleSequentialChange(true)}
        disabled={consecutive}
      />
      Sequential
      <HelpTooltip>Tokens will be minted with sequential IDs.</HelpTooltip>
    </label>

    <label class:checked={!sequential && mintable}>
      <input
        type="radio"
        name="minting-mode"
        value="non_sequential"
        checked={!sequential && mintable && !consecutive}
        on:change={() => handleSequentialChange(false)}
        disabled={consecutive}
      />
      Non-Sequential
      <HelpTooltip>Tokens can be minted with arbitrary IDs.</HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>
