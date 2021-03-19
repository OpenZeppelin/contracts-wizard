<script lang="ts">
  import Tooltip from './Tooltip.svelte';

  import type { GenericOptions } from '@openzeppelin/wizard';

  export const opts: Required<GenericOptions> = {
    kind: 'ERC721',
    name: 'MyToken',
    symbol: 'MTK',
    baseUri: '',
    enumerable: false,
    uriStorage: false,
    burnable: false,
    pausable: false,
    access: 'ownable',
  },
</script>

<section class="controls-section">
  <h1>Settings</h1>

    <div class="grid grid-cols-2-1 grid-gap-2">
      <label class="labeled-input">
        <span>Name</span>
        <input bind:value={opts.name}>
      </label>
      <label class="labeled-input">
        <span>Symbol</span>
        <input bind:value={opts.symbol}>
      </label>
    </div>
    <label class="labeled-input">
      <span>Base URI</span>
      <input bind:value={opts.baseUri}>
    </label>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.enumerable}>
      Enumerable
      <Tooltip link="https://docs.openzeppelin.com/contracts/3.x/api/token/erc721#ERC721Enumerable">
        Provide functions to enumerate all tokens or those owned by an account.
      </Tooltip>
    </label><label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.uriStorage}>
      URI Storage
      <Tooltip link="https://docs.openzeppelin.com/contracts/3.x/api/token/erc721#ERC721URIStorage">
        Add internal functions that update token URIs for individual token IDs.
      </Tooltip>
    </label>
    <label class:checked={opts.burnable}>
      <input type="checkbox" bind:checked={opts.burnable}>
      Burnable
      <Tooltip link="https://docs.openzeppelin.com/contracts/3.x/api/token/erc721#ERC721Burnable">
        Provide a function for holders to destroy their tokens.
      </Tooltip>
    </label>
    <label class:checked={opts.pausable}>
      <input type="checkbox" bind:checked={opts.pausable}>
      Pausable
      <Tooltip link="https://docs.openzeppelin.com/contracts/3.x/api/utils#Pausable">
        Provides a modifier that can pause contract functionality when requested by a privileged account. Useful for emergency response.
      </Tooltip>
    </label>
    <label class:checked={opts.mintable}>
      <input type="checkbox" bind:checked={opts.mintable}>
      Mintable
      <Tooltip link="https://docs.openzeppelin.com/contracts/3.x/api/token/erc721#ERC721Mintable">
        Makes the token mintable by privileged accounts.
      </Tooltip>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>Access Control</h1>

  <div class="checkbox-group">
    <label class:checked={opts.access === 'ownable'}>
      <input type="radio" bind:group={opts.access} value="ownable">
      Ownable
      <Tooltip link="https://docs.openzeppelin.com/contracts/3.x/api/access#Ownable">
        Simple mechanism where there is a single account authorized for all privileged actions.
      </Tooltip>
    </label>
    <label class:checked={opts.access === 'roles'}>
      <input type="radio" bind:group={opts.access} value="roles">
      Roles
      <Tooltip link="https://docs.openzeppelin.com/contracts/3.x/api/access#AccessControl">
        Flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.
      </Tooltip>
    </label>
  </div>
</section>
