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
      Signature Validation
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/interfaces#IERC1271">
        Enables smart contracts to validate signatures through a standard `isValidSignature` method. Unlike EOAs
        (regular accounts) that use private keys, this allows contracts to implement custom signature validation logic,
        making them capable of acting as signing entities for operations like approvals, swaps, or any signed messages.
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
      Cross Account Protection
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/api/utils#ERC7739">
        Enhances signature security by using a defensive rehashing scheme that prevents signature replay attacks across
        multiple smart accounts owned by the same EOA. This preserves the readability of signed contents while ensuring
        each signature is uniquely bound to a specific account and chain.
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
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc721#ERC721Holder">
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
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc1155#ERC1155Holder">
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
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/api/account#ERC7821">
        Enables atomic execution of multiple transactions in a single operation, reducing total transaction costs and
        latency. Supports different execution modes including single calls, batch calls, and delegatecalls with
        customizable error handling.
      </HelpTooltip>
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
      Modules
      <HelpTooltip link="https://eips.ethereum.org/EIPS/eip-7579">
        Enables a modular architecture where account functionality can be extended through external contracts (modules).
        Supports validators for signature verification, executors for transaction handling, fallback handlers for
        additional features. Hooks are not supported by default.
      </HelpTooltip>
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
      <HelpTooltip link="https://eips.ethereum.org/EIPS/eip-7579#hooks">
        Enables custom logic to be executed before and after account operations. Hooks can validate transactions, track
        state changes, implement security checks, or add any custom behavior around executions and module management.
      </HelpTooltip>
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
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/account-abstraction#selecting_a_signer">
        Defines the base signature validation mechanism for the account. This implementation will be used by ERC-1271's
        isValidSignature to verify signatures on behalf of the account.
      </HelpTooltip>
    </label>
    <label class:checked={opts.signer === 'ECDSA'} class="subcontrol">
      <input type="radio" bind:group={opts.signer} value="ECDSA" />
      ECDSA
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#ECDSA">
        Standard Ethereum signature validation using secp256k1. Validates signatures against a specified owner address,
        making it suitable for accounts controlled by EOAs.
      </HelpTooltip>
    </label>
    <label class:checked={opts.signer === 'ERC7702'} class="subcontrol">
      <input type="radio" bind:group={opts.signer} value="ERC7702" />
      EOA Delegation
      <HelpTooltip link="https://eips.ethereum.org/EIPS/eip-7702">
        Special ECDSA validation that uses the account's own address as the signer. Enables EOAs to delegate execution
        rights to the account while maintaining their native signature verification.
      </HelpTooltip>
    </label>
    <label class:checked={opts.signer === 'P256'} class="subcontrol">
      <input type="radio" bind:group={opts.signer} value="P256" />
      P256
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#P256">
        Signature validation using the NIST P-256 curve (secp256r1). Useful for integrating with external systems and
        hardware that use this standardized curve, such as Apple's Passkeys or certain HSMs.
      </HelpTooltip>
    </label>
    <label class:checked={opts.signer === 'RSA'} class="subcontrol">
      <input type="radio" bind:group={opts.signer} value="RSA" />
      RSA
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#RSA">
        RSA PKCS#1 v1.5 signature validation following RFC8017. Enables integration with traditional PKI systems and
        hardware security modules that use RSA keys.
      </HelpTooltip>
    </label>
  </div>
</section>

<InfoSection bind:info={opts.info} />
