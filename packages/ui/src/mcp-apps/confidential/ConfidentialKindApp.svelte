<script lang="ts">
  import type { App } from '@modelcontextprotocol/ext-apps';

  import KindShell from '../KindShell.svelte';
  import type { HostSendCaps } from '../deliver-contract';
  import { deliverContractToHost } from '../deliver-contract';
  import ERC7984Controls from '../../confidential/ERC7984Controls.svelte';

  import hljs from '../../solidity/highlightjs';
  import { injectHyperlinks } from '../../confidential/inject-hyperlinks';

  import { ContractBuilder, OptionsError } from '@openzeppelin/wizard';
  import type { Contract, OptionsErrorMessages } from '@openzeppelin/wizard';
  import { buildGeneric, printContract } from '@openzeppelin/wizard-confidential';
  import type { KindedOptions, Kind } from '@openzeppelin/wizard-confidential';

  export let kind: Kind;
  export let mcpApp: App;
  export let hostConnected = false;
  export let hostConnectError: string | undefined = undefined;
  export let hostSendCaps: HostSendCaps = { message: false, updateModelContext: false };

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
  $: highlightedCode = injectHyperlinks(hljs.highlight('solidity', code).value);
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
    {#if kind === 'ERC7984'}
      <ERC7984Controls bind:opts {errors} />
    {/if}
  </svelte:fragment>
</KindShell>
