<script lang="ts">
  import type { App } from '@modelcontextprotocol/ext-apps';

  import KindShell from '../KindShell.svelte';
  import ERC20Controls from '../../stylus/ERC20Controls.svelte';
  import ERC721Controls from '../../stylus/ERC721Controls.svelte';
  import ERC1155Controls from '../../stylus/ERC1155Controls.svelte';

  import hljs from '../../stylus/highlightjs';
  import { injectHyperlinks } from '../../stylus/inject-hyperlinks';

  import type { KindedOptions, Kind, Contract, OptionsErrorMessages } from '@openzeppelin/wizard-stylus';
  import { ContractBuilder, buildGeneric, printContract, OptionsError } from '@openzeppelin/wizard-stylus';

  export let kind: Kind;
  export let mcpApp: App;

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
        throw e;
      }
    }
  }

  $: code = printContract(contract);
  $: highlightedCode = injectHyperlinks(hljs.highlight('rust', code).value);
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

<KindShell {highlightedCode} {hasErrors} {code} highlightClass="-stylus" {onUseContract}>
  <svelte:fragment slot="controls">
    {#if kind === 'ERC20'}
      <ERC20Controls bind:opts {errors} />
    {:else if kind === 'ERC721'}
      <ERC721Controls bind:opts {errors} />
    {:else if kind === 'ERC1155'}
      <ERC1155Controls bind:opts {errors} />
    {/if}
  </svelte:fragment>
</KindShell>
