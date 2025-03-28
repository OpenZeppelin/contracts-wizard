<script lang="ts">
  import CopyIcon from './icons/CopyIcon.svelte';
  import DownloadIcon from './icons/DownloadIcon.svelte';
  import Tooltip from './Tooltip.svelte';
</script>

<!-- Fake Copy and Download buttons for display when there are errors in the input options -->
<div class="action flex flex-row gap-2 shrink-0">
  <Tooltip
    let:trigger
    theme="light-red border"
    hideOnClick={false}
    interactive
  >
    <button
      use:trigger
      class="action-button p-3 min-w-[40px]"
      class:disabled={true}
      title="Copy to Clipboard"
    >
      <CopyIcon />
    </button>
    <div slot="content">
      <p>There are errors in the input options.</p>
      <p>Fix them to continue.</p>
    </div>
  </Tooltip>
  <Tooltip
    let:trigger
    theme="light-red border"
    hideOnClick={false}
    interactive
  >
    <button
      use:trigger
      class="action-button with-text"
      class:disabled={true}
      title="Download"
    >
      <DownloadIcon />
      Download
    </button>
    <div slot="content">
      <p>There are errors in the input options.</p>
      <p>Fix them to continue.</p>
    </div>
  </Tooltip>
</div>
