<script lang="ts">
  import type { TransferPolicy } from '@openzeppelin/wizard-miden';

  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import HelpTooltip from '../common/HelpTooltip.svelte';

  export let transferPolicy: TransferPolicy;
  // What the faucet issues, as used in the help text: "the token" or "tokens"
  export let asset: string;
</script>

<ExpandableToggleRadio
  label="Transfer Policy"
  bind:value={transferPolicy}
  defaultValue="blocklist"
  helpContent="Restricts who can send and receive {asset}. Every transfer then consults the faucet, so transfers cost more to prove and must reach the chain within about a minute. This extra cost is permanent."
>
  <div class="checkbox-group">
    <label class:checked={transferPolicy === 'allowlist'}>
      <input type="radio" bind:group={transferPolicy} value="allowlist" />
      Allowlist
      <HelpTooltip>
        Only accounts on the allowlist can send or receive {asset}. The list starts empty, so privileged accounts must
        add an account before it can receive {asset}, including newly minted tokens.
      </HelpTooltip>
    </label>
    <label class:checked={transferPolicy === 'blocklist'}>
      <input type="radio" bind:group={transferPolicy} value="blocklist" />
      Blocklist
      <HelpTooltip>
        Accounts on the blocklist can neither send nor receive {asset}. Privileged accounts manage the blocklist.
      </HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>
