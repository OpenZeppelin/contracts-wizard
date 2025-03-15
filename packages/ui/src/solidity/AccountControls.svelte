<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard';
  import { account } from '@openzeppelin/wizard';

  import InfoSection from './InfoSection.svelte';

  export let opts: Required<KindedOptions['Account']> = {
    kind: 'Account',
    ...account.defaults,
  };

  export let errors: undefined | OptionsErrorMessages;
</script>

<section class="controls-section">
  <div class="text-sm text-gray-500">
    <strong>* Experimental:</strong>
    <span class="italic">Some of the following features are not audited and are subject to change</span>
  </div>
</section>

<section class="controls-section">
  <h1>Settings</h1>

  <label class="labeled-input">
    <span>Name</span>
    <input bind:value={opts.name} />
  </label>
</section>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Base</span>
      <HelpTooltip align="right" link="https://docs.openzeppelin.com/contracts/api/token/erc721#ERC721accountBase">
        Select an opinionated base contract to start with.
      </HelpTooltip>
    </label>
  </h1>

  <div class="checkbox-group">
    <label class:checked={opts.accountBase === 'AccountCore'}>
      <input type="radio" bind:group={opts.accountBase} value="AccountCore" />
      Core
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/0.0.1/api/account#AccountCore">
        Minimal logic to process user operations following ERC-4337. Requires an implementation of an AbstractSigner to
        validate signatures.
      </HelpTooltip>
    </label>
    <label class:checked={opts.accountBase === 'Account'}>
      <input type="radio" bind:group={opts.accountBase} value="Account" />
      ERC-7739 & Tokens
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/0.0.1/api/account#Account">
        Opinionated extension of the AccountCore contract with ERC-7739 signature replayability protection and
        additional features like ERC721Holder, ERC1155Holder for token support.
      </HelpTooltip>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.ERC7821}>
      <input
        type="checkbox"
        checked={!!opts.ERC7821 || !!opts.ERC7579}
        disabled={!!opts.ERC7579}
        on:change={e => {
          opts.ERC7821 = e.currentTarget?.checked;
        }}
      />
      Batched Execution
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/0.0.1/account-abstraction#selecting_a_signer"
        >Implement signature validation for the account.</HelpTooltip
      >
    </label>
    <label class:checked={!!opts.ERC7579}>
      <input
        type="checkbox"
        checked={!!opts.ERC7579}
        on:change={e => {
          if (e.currentTarget?.checked) opts.ERC7579 = 'AccountERC7579';
          else opts.ERC7579 = false;
        }}
      />
      ERC-7579 Modules
      <HelpTooltip link="https://eips.ethereum.org/EIPS/eip-7579">Enable functionality through modules</HelpTooltip>
    </label>
    <label class:checked={opts.ERC7579 === 'AccountERC7579Hooked'} class="subcontrol">
      <input
        type="checkbox"
        checked={opts.ERC7579 === 'AccountERC7579Hooked'}
        on:change={e => {
          if (e.currentTarget?.checked) opts.ERC7579 = 'AccountERC7579Hooked';
          else opts.ERC7579 = 'AccountERC7579';
        }}
      />
      Hooks
      <HelpTooltip link="https://eips.ethereum.org/EIPS/eip-7579#hooks"
        >Hooks enable support for pre and post checks after execution.</HelpTooltip
      >
    </label>
    <label class:checked={opts.signer}>
      <input
        type="checkbox"
        checked={!!opts.signer}
        on:change={e => {
          if (e.currentTarget?.checked) opts.signer = 'ECDSA';
          else opts.signer = false;
        }}
      />
      Signer
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/0.0.1/account-abstraction#selecting_a_signer"
        >Implement signature validation for the account.</HelpTooltip
      >
    </label>
    <label class:checked={opts.signer === 'ERC7702'} class="subcontrol">
      <input type="radio" bind:group={opts.signer} value="ERC7702" />
      EIP-7702
      <HelpTooltip link="https://eips.ethereum.org/EIPS/eip-7702">
        ECDSA validation for the account address where is deployed. EOAs can delegate execution to them to validate
        their own native signatures.
      </HelpTooltip>
    </label>
    <label class:checked={opts.signer === 'ECDSA'} class="subcontrol">
      <input type="radio" bind:group={opts.signer} value="ECDSA" />
      ECDSA
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/utils#ECDSA">
        ECDSA validation for an EOA account.
      </HelpTooltip>
    </label>
    <label class:checked={opts.signer === 'P256'} class="subcontrol">
      <input type="radio" bind:group={opts.signer} value="P256" />
      P256
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/utils#P256">
        Signature validation for the secp256r1 curve. A NIST standard curve.
      </HelpTooltip>
    </label>
    <label class:checked={opts.signer === 'RSA'} class="subcontrol">
      <input type="radio" bind:group={opts.signer} value="RSA" />
      RSA
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/utils#RSA">
        RSA PKCS#1 v1.5 signature verification implementation according to RFC8017.
      </HelpTooltip>
    </label>
  </div>
</section>

<InfoSection bind:info={opts.info} />
