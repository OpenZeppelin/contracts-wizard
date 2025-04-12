<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard';
  import { account } from '@openzeppelin/wizard';

  import InfoSection from './InfoSection.svelte';

  export let opts: Required<KindedOptions['Account']> = {
    kind: 'Account',
    ...account.defaults,
  };

  let wasERC7579 = false;
  $: {
    if (!wasERC7579 && !!opts.ERC7579) {
      opts.ERC1271 = 'ERC7739';
    }
    wasERC7579 = !!opts.ERC7579;
  }

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
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={!!opts.ERC1271}>
      <input
        type="checkbox"
        checked={!!opts.ERC1271 || !!opts.ERC7579}
        disabled={!!opts.ERC7579}
        on:change={e => {
          if (e.currentTarget?.checked) opts.ERC1271 = 'ERC7739';
          else opts.ERC1271 = false;
        }}
      />
      ERC-1271 Signatures
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/interfaces#IERC1271">
        Validate signatures for the account using the standard <code>isValidSignature</code> method defined in ERC-1271.
      </HelpTooltip>
    </label>
    <label class:checked={opts.ERC1271 === 'ERC7739'} class="subcontrol">
      <input
        type="checkbox"
        checked={opts.ERC1271 === 'ERC7739'}
        on:change={e => {
          if (e.currentTarget?.checked) opts.ERC1271 = 'ERC7739';
          else opts.ERC1271 = 'ERC1271';
        }}
      />
      ERC-7739
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/api/utils#ERC7739"
        >Only validates signatures that are linked to the Account's domain separator to avoid replaying the same
        signature across different accounts controlled by the same owner.
      </HelpTooltip>
    </label>
    <label class:checked={opts.ERC721Holder}>
      <input
        type="checkbox"
        checked={!!opts.ERC721Holder}
        on:change={e => {
          opts.ERC721Holder = e.currentTarget?.checked;
        }}
      />
      ERC-721 Holder
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/token/erc721#ERC721Holder">
        Implement native support for receiving ERC-721 tokens.
      </HelpTooltip>
    </label>
    <label class:checked={opts.ERC1155Holder}>
      <input
        type="checkbox"
        checked={!!opts.ERC1155Holder}
        on:change={e => {
          opts.ERC1155Holder = e.currentTarget?.checked;
        }}
      />
      ERC-1155 Holder
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/5.x/api/token/erc1155#ERC1155Holder">
        Implement native support for receiving ERC-1155 tokens.
      </HelpTooltip>
    </label>
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
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/0.0.1/api/account#ERC7821"
        >Implements a minimal batch executor following ERC-7821.</HelpTooltip
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
      <HelpTooltip link="https://eips.ethereum.org/EIPS/eip-7579">Enable functionality through modules.</HelpTooltip>
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
