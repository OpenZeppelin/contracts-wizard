<script lang="ts" context="module">
  let nextId = 0;
</script>

<script lang="ts">
  import type { Info, OptionsErrorMessages } from '@openzeppelin/wizard';
  import { infoDefaults, ACE_LICENSE, ACE_LICENSE_URL, ACE_GRANTS_URL } from '@openzeppelin/wizard';

  import { getContext } from 'svelte';
  import { readable } from 'svelte/store';
  import HelpTooltip from '../common/HelpTooltip.svelte';
  import { error } from '../common/error-tooltip';
  import {
    MCP_EXTERNAL_LINKS_CONTEXT,
    externalLinkAttrs,
    type McpExternalLinks,
    type McpExternalLinksStore,
  } from '../common/external-links';

  export let info: Info;

  export let errors: OptionsErrorMessages | undefined = undefined;

  /** ACE output is always BUSL-1.1; the saved license is kept so it returns when ACE is disabled. */
  export let aceEnabled = false;

  const aceLicenseDescriptionId = `ace-license-description-${nextId++}`;

  // MCP Apps route outbound clicks through the host (KindShell); hide links the host cannot open.
  const linksContext = getContext<McpExternalLinksStore | undefined>(MCP_EXTERNAL_LINKS_CONTEXT);
  const externalLinks = linksContext ?? readable<McpExternalLinks>({ canOpen: false });
  $: link = externalLinkAttrs(linksContext != null, $externalLinks.canOpen);
</script>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Info</span>
    </label>
  </h1>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Security Contact
      <HelpTooltip link="https://github.com/ethereum-lists/contracts/blob/main/README.md#tracking-new-deployments">
        Where people can contact you to report security issues. Will only be visible if contract metadata is verified.
      </HelpTooltip>
    </span>
    <input bind:value={info.securityContact} placeholder="security@example.com" use:error={errors?.securityContact} />
  </label>

  <label class="labeled-input">
    <span>License</span>
    {#if aceEnabled}
      <input value={ACE_LICENSE} readonly disabled aria-describedby={aceLicenseDescriptionId} />
    {:else}
      <input bind:value={info.license} placeholder={infoDefaults.license} use:error={errors?.license} />
    {/if}
  </label>
  {#if aceEnabled}
    <p id={aceLicenseDescriptionId} class="text-sm text-gray-500">
      Contracts generated with ACE use BUSL-1.1. Review the
      {#if link.show}
        <a class="underline" href={ACE_LICENSE_URL} target={link.target} rel={link.rel}>ACE license</a>
        and
        <a class="underline" href={ACE_GRANTS_URL} target={link.target} rel={link.rel}>additional use grants</a>
      {:else}
        ACE license and additional use grants
      {/if}
      before production use.
    </p>
  {/if}
</section>
