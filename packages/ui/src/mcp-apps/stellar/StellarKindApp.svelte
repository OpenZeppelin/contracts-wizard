<script lang="ts">
  import { tick } from 'svelte';
  import type { App } from '@modelcontextprotocol/ext-apps';

  import KindShell from '../KindShell.svelte';
  import FungibleControls from '../../stellar/FungibleControls.svelte';
  import NonFungibleControls from '../../stellar/NonFungibleControls.svelte';
  import StablecoinControls from '../../stellar/StablecoinControls.svelte';
  import GovernorControls from '../../stellar/GovernorControls.svelte';
  import VaultControls from '../../stellar/VaultControls.svelte';

  import hljs from '../../stellar/highlightjs';
  import { injectHyperlinks } from '../../stellar/inject-hyperlinks';

  import type { KindedOptions, Kind, Contract, OptionsErrorMessages } from '@openzeppelin/wizard-stellar';
  import { ContractBuilder, buildGeneric, printContract, OptionsError } from '@openzeppelin/wizard-stellar';

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

{#if showCode}
  <KindShell {highlightedCode} {hasErrors} {code} highlightClass="-stellar" {onUseContract}>
    <svelte:fragment slot="controls">
      {#if kind === 'Fungible'}
        <FungibleControls bind:opts {errors} />
      {:else if kind === 'NonFungible'}
        <NonFungibleControls bind:opts {errors} />
      {:else if kind === 'Stablecoin'}
        <StablecoinControls bind:opts {errors} />
      {:else if kind === 'Governor'}
        <GovernorControls bind:opts {errors} />
      {:else if kind === 'Vault'}
        <VaultControls bind:opts {errors} />
      {/if}
    </svelte:fragment>
  </KindShell>
{/if}
