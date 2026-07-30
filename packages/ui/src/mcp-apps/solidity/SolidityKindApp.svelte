<script lang="ts">
  import type { App } from '@modelcontextprotocol/ext-apps';

  import KindShell from '../KindShell.svelte';
  import type { HostSendCaps } from '../deliver-contract';
  import { deliverContractToHost } from '../deliver-contract';
  import { cloneOpts, nextInitialOpts, optsEqual } from '../opts-snapshot';
  import ERC20Controls from '../../solidity/ERC20Controls.svelte';
  import ERC721Controls from '../../solidity/ERC721Controls.svelte';
  import ERC1155Controls from '../../solidity/ERC1155Controls.svelte';
  import StablecoinControls from '../../solidity/StablecoinControls.svelte';
  import RealWorldAssetControls from '../../solidity/RealWorldAssetControls.svelte';
  import AccountControls from '../../solidity/AccountControls.svelte';
  import GovernorControls from '../../solidity/GovernorControls.svelte';
  import CustomControls from '../../solidity/CustomControls.svelte';

  import hljs from '../../solidity/highlightjs';
  import { injectHyperlinks } from '../../solidity/inject-hyperlinks';

  import type { KindedOptions, Kind, Contract, OptionsErrorMessages } from '@openzeppelin/wizard';
  import { ContractBuilder, buildGeneric, printContract, OptionsError } from '@openzeppelin/wizard';

  export let kind: Kind;
  export let mcpApp: App;
  export let hostConnected = false;
  export let hostConnectError: string | undefined = undefined;
  export let hostSendCaps: HostSendCaps = { message: false, updateModelContext: false, openLinks: false };

  // Bound by the active Controls component (same pattern as App.svelte allOpts[tab])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let opts: any = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let initialOpts: any = undefined;
  let drifted = false;
  let errors: OptionsErrorMessages | undefined;
  let contract: Contract = new ContractBuilder('MyToken');

  function mergeHostOpts(incoming: Record<string, unknown> | undefined, source: 'input' | 'result') {
    if (!incoming) return;
    const previous = opts;
    opts = { ...(opts ?? {}), ...incoming, kind };
    initialOpts = nextInitialOpts(initialOpts, previous, opts, source);
  }

  mcpApp.ontoolinput = params => {
    mergeHostOpts(params.arguments as Record<string, unknown> | undefined, 'input');
  };

  mcpApp.ontoolresult = result => {
    const structured = result.structuredContent as { opts?: Record<string, unknown> } | undefined;
    if (structured?.opts) {
      mergeHostOpts(structured.opts, 'result');
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
    drifted = initialOpts != null && !optsEqual(opts, initialOpts);
  } else {
    drifted = false;
  }

  $: code = printContract(contract);
  $: highlightedCode = hostSendCaps.openLinks
    ? injectHyperlinks(hljs.highlight('solidity', code).value)
    : hljs.highlight('solidity', code).value;
  $: hasErrors = errors !== undefined;

  function restoreOriginal() {
    if (initialOpts == null) return;
    opts = cloneOpts(initialOpts);
  }

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
  {mcpApp}
  {drifted}
  onRestoreOriginal={restoreOriginal}
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
