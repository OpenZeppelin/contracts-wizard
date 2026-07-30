<script lang="ts">
  import type { App } from '@modelcontextprotocol/ext-apps';

  import KindShell from '../KindShell.svelte';
  import type { HostSendCaps } from '../deliver-contract';
  import { deliverContractToHost } from '../deliver-contract';
  import { cloneOpts, nextInitialOpts, optsEqual } from '../opts-snapshot';
  import ERC20Controls from '../../cairo/ERC20Controls.svelte';
  import ERC721Controls from '../../cairo/ERC721Controls.svelte';
  import ERC1155Controls from '../../cairo/ERC1155Controls.svelte';
  import CustomControls from '../../cairo/CustomControls.svelte';
  import AccountControls from '../../cairo/AccountControls.svelte';
  import MultisigControls from '../../cairo/MultisigControls.svelte';
  import GovernorControls from '../../cairo/GovernorControls.svelte';
  import VestingControls from '../../cairo/VestingControls.svelte';

  import hljs from '../../cairo/highlightjs';
  import { injectHyperlinks } from '../../cairo/inject-hyperlinks';

  import type { KindedOptions, Kind, Contract, OptionsErrorMessages } from '@openzeppelin/wizard-cairo';
  import {
    ContractBuilder,
    buildGeneric,
    printContract,
    OptionsError,
    macrosDefaults,
  } from '@openzeppelin/wizard-cairo';

  export let kind: Kind;
  export let mcpApp: App;
  export let hostConnected = false;
  export let hostConnectError: string | undefined = undefined;
  export let hostSendCaps: HostSendCaps = { message: false, updateModelContext: false, openLinks: false };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let opts: any = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let initialOpts: any = undefined;
  let drifted = false;
  let errors: OptionsErrorMessages | undefined;
  let contract: Contract = new ContractBuilder('MyToken', {
    withComponents: macrosDefaults.withComponents,
  });

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
    ? injectHyperlinks(hljs.highlight('cairo', code).value)
    : hljs.highlight('cairo', code).value;
  $: hasErrors = errors !== undefined;

  function restoreOriginal() {
    if (initialOpts == null) return;
    opts = cloneOpts(initialOpts);
  }

  async function onUseContract(currentCode: string) {
    await deliverContractToHost(mcpApp, currentCode, 'cairo');
  }
</script>

<KindShell
  {highlightedCode}
  {hasErrors}
  {code}
  highlightClass="-cairo"
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
    {:else if kind === 'Account'}
      <AccountControls bind:opts {errors} accountType={opts?.type} />
    {:else if kind === 'Multisig'}
      <MultisigControls bind:opts {errors} />
    {:else if kind === 'Governor'}
      <GovernorControls bind:opts {errors} />
    {:else if kind === 'Vesting'}
      <VestingControls bind:opts {errors} />
    {:else if kind === 'Custom'}
      <CustomControls bind:opts {errors} />
    {/if}
  </svelte:fragment>
</KindShell>
