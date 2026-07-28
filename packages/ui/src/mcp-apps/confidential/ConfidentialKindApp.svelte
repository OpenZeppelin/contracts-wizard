<script lang="ts">
  import { tick } from 'svelte';
  import type { App } from '@modelcontextprotocol/ext-apps';

  import KindShell from '../KindShell.svelte';
  import ERC7984Controls from '../../confidential/ERC7984Controls.svelte';

  import hljs from '../../solidity/highlightjs';
  import { injectHyperlinks } from '../../confidential/inject-hyperlinks';

  import { ContractBuilder, OptionsError } from '@openzeppelin/wizard';
  import type { Contract, OptionsErrorMessages } from '@openzeppelin/wizard';
  import { buildGeneric, printContract } from '@openzeppelin/wizard-confidential';
  import type { KindedOptions, Kind } from '@openzeppelin/wizard-confidential';

  export let kind: Kind;
  export let mcpApp: App;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let opts: any = undefined;
  let errors: OptionsErrorMessages | undefined;
  let contract: Contract = new ContractBuilder('MyToken');
  let showCode = true;

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

  async function allowRendering() {
    showCode = false;
    await tick();
    showCode = true;
  }

  $: if (opts) {
    try {
      contract = buildGeneric(opts as KindedOptions[Kind]);
      errors = undefined;
    } catch (e: unknown) {
      if (e instanceof OptionsError) {
        errors = e.messages;
      } else {
        throw e;
      }
    }
    allowRendering();
  }

  $: code = printContract(contract);
  $: highlightedCode = injectHyperlinks(hljs.highlight('solidity', code).value);
  $: hasErrors = errors !== undefined;

  async function onUseContract(currentCode: string) {
    await mcpApp.updateModelContext({
      content: [{ type: 'text', text: currentCode }],
    });
    await mcpApp.sendMessage({
      role: 'user',
      content: [{ type: 'text', text: 'Use this generated contract in the project.' }],
    });
  }
</script>

{#if showCode}
  <KindShell {highlightedCode} {hasErrors} {code} highlightClass="-solidity" {onUseContract}>
    <svelte:fragment slot="controls">
      {#if kind === 'ERC7984'}
        <ERC7984Controls bind:opts {errors} />
      {/if}
    </svelte:fragment>
  </KindShell>
{/if}
