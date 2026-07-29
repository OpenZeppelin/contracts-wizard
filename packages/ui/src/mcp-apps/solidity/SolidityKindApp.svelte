<script lang="ts">
  import type { App } from '@modelcontextprotocol/ext-apps';

  import KindShell from '../KindShell.svelte';
  import type { HostSendCaps } from '../deliver-contract';
  import { deliverContractToHost } from '../deliver-contract';
  import ERC20Controls from '../../solidity/ERC20Controls.svelte';
  import ERC721Controls from '../../solidity/ERC721Controls.svelte';
  import ERC1155Controls from '../../solidity/ERC1155Controls.svelte';
  import StablecoinControls from '../../solidity/StablecoinControls.svelte';
  import RealWorldAssetControls from '../../solidity/RealWorldAssetControls.svelte';
  import AccountControls from '../../solidity/AccountControls.svelte';
  import GovernorControls from '../../solidity/GovernorControls.svelte';
  import CustomControls from '../../solidity/CustomControls.svelte';

  import hljs from '../../solidity/highlightjs';

  import type { KindedOptions, Kind, Contract, OptionsErrorMessages } from '@openzeppelin/wizard';
  import { ContractBuilder, buildGeneric, printContract, OptionsError } from '@openzeppelin/wizard';

  export let kind: Kind;
  export let mcpApp: App;
  export let hostConnected = false;
  export let hostConnectError: string | undefined = undefined;
  export let hostSendCaps: HostSendCaps = { message: false, updateModelContext: false };

  // Bound by the active Controls component (same pattern as App.svelte allOpts[tab])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let opts: any = undefined;
  let errors: OptionsErrorMessages | undefined;
  let contract: Contract = new ContractBuilder('MyToken');

  function mergeHostOpts(incoming: Record<string, unknown> | undefined) {
    if (!incoming) return;
    opts = { ...(opts ?? {}), ...incoming, kind };
  }

  mcpApp.ontoolinput = params => {
    mergeHostOpts(params.arguments as Record<string, unknown> | undefined);
  };

  mcpApp.ontoolresult = result => {
    const structured = result.structuredContent as { opts?: Record<string, unknown> } | undefined;
    if (structured?.opts) {
      mergeHostOpts(structured.opts);
    }
  };

  $: if (opts) {
    try {
      contract = buildGeneric(opts as KindedOptions[Kind]);
      errors = undefined;
    } catch (e: unknown) {
      if (e instanceof OptionsError) {
        errors = e.messages;
      } else {
        const message = e instanceof Error ? e.message : String(e);
        errors = { _: message || 'Failed to build contract' };
      }
    }
  }

  $: code = printContract(contract);
  $: highlightedCode = hljs.highlight('solidity', code).value;
  $: hasErrors = errors !== undefined;

  async function onUseContract(currentCode: string) {
    await deliverContractToHost(mcpApp, currentCode, 'solidity');
  }
</script>

<KindShell
  {highlightedCode}
  {hasErrors}
  {code}
  highlightClass="-solidity"
  {onUseContract}
  {hostConnected}
  {hostConnectError}
  {hostSendCaps}
>
  <svelte:fragment slot="controls">
    {#if kind === 'ERC20'}
      <ERC20Controls bind:opts {errors} />
    {:else if kind === 'ERC721'}
      <ERC721Controls bind:opts {errors} />
    {:else if kind === 'ERC1155'}
      <ERC1155Controls bind:opts {errors} />
    {:else if kind === 'Stablecoin'}
      <StablecoinControls bind:opts {errors} />
    {:else if kind === 'RealWorldAsset'}
      <RealWorldAssetControls bind:opts {errors} />
    {:else if kind === 'Account'}
      <AccountControls bind:opts {errors} />
    {:else if kind === 'Governor'}
      <GovernorControls bind:opts {errors} />
    {:else if kind === 'Custom'}
      <CustomControls bind:opts {errors} />
    {/if}
  </svelte:fragment>
</KindShell>
