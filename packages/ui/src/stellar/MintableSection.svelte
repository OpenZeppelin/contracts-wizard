<script lang="ts">
  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import HelpTooltip from '../common/HelpTooltip.svelte';
  import { error } from '../common/error-tooltip';

  export let mintable: boolean;
  export let sequential: boolean;
  export let consecutive: boolean;
  export let errors: undefined | { mintable?: string; sequential?: string };

  let previousConsecutive = consecutive;

  let mode: false | 'non_sequential' | 'sequential' = false;

  $: {
    switch (mode) {
      case 'sequential':
        sequential = true;
        mintable = true;
        break;
      case 'non_sequential':
        sequential = false;
        mintable = true;
        break;
      case false:
        sequential = false;
        mintable = false;
        break;
      default:
        const _: never = mode;
        break;
    }
  }

  $: if (!previousConsecutive && consecutive) {
    mode = false;
  }

  $: previousConsecutive = consecutive;
</script>

<ExpandableToggleRadio
  label="Minting"
  bind:value={mode}
  defaultValue={'non_sequential'}
  helpContent="Configure minting mode for NFTs."
  disabled={consecutive}
  error={errors?.mintable || errors?.sequential}
>
  <div class="checkbox-group">
    <label class:checked={mode === 'non_sequential'} use:error={errors?.mintable}>
      <input
        type="radio"
        name="minting-mode"
        value="non_sequential"
        bind:group={mode}
        disabled={consecutive || !mintable}
      />
      Non-Sequential
      <HelpTooltip>Tokens can be minted with arbitrary IDs.</HelpTooltip>
    </label>

    <label class:checked={mode === 'sequential'} use:error={errors?.sequential}>
      <input
        type="radio"
        name="minting-mode"
        value="sequential"
        bind:group={mode}
        disabled={consecutive || !mintable}
      />
      Sequential
      <HelpTooltip>Tokens will be minted with sequential IDs.</HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>
