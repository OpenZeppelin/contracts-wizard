<script lang="ts">
  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import HelpTooltip from '../common/HelpTooltip.svelte';
  import { error } from '../common/error-tooltip';

  export let mintable: boolean;
  export let sequential: boolean;
  export let consecutive: boolean;
  export let errors: undefined | { mintable?: string; sequential?: string };

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

  $: if (!mintable) {
    sequential = false;
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
    <label class:checked={!sequential && mintable} use:error={errors?.mintable}>
      <input
        type="radio"
        name="minting-mode"
        value="non_sequential"
        bind:group={mintable}
        disabled={consecutive || !mintable}
      />
      Non-Sequential
      <HelpTooltip>Tokens can be minted with arbitrary IDs.</HelpTooltip>
    </label>

    <label class:checked={sequential} use:error={errors?.sequential}>
      <input
        type="radio"
        name="minting-mode"
        value="sequential"
        bind:group={sequential}
        disabled={consecutive || !mintable}
      />
      Sequential
      <HelpTooltip>Tokens will be minted with sequential IDs.</HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>
