<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard';
  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import { account } from '@openzeppelin/wizard';

  import InfoSection from './InfoSection.svelte';

  export let opts: Required<KindedOptions['Account']> = {
    kind: 'Account',
    ...account.defaults,
  };

  let wasERC7579Modules = false;
  $: {
    if (!wasERC7579Modules && !!opts.ERC7579Modules) {
      opts.signatureValidation = 'ERC7739';
    }
    wasERC7579Modules = !!opts.ERC7579Modules;
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
    <label class:checked={!!opts.signatureValidation}>
      <input
        type="checkbox"
        checked={!!opts.signatureValidation || !!opts.ERC7579Modules}
        disabled={!!opts.ERC7579Modules}
        on:change={e => {
          if (e.currentTarget?.checked) opts.signatureValidation = 'ERC7739';
          else opts.signatureValidation = false;
        }}
      />
      Signature Validation
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/accounts#signature_validation">
        Enables smart contracts to validate signatures through a standard <code>isValidSignature</code> method. Unlike EOAs
        (regular accounts) that use private keys, this allows contracts to implement custom signature validation logic, making
        them capable of acting as signing entities for operations like approvals, swaps, or any signed messages.
      </HelpTooltip>
    </label>
    <label class:checked={opts.signatureValidation === 'ERC7739'} class="subcontrol">
      <input
        type="checkbox"
        checked={opts.signatureValidation === 'ERC7739'}
        on:change={e => {
          if (e.currentTarget?.checked) opts.signatureValidation = 'ERC7739';
          else opts.signatureValidation = 'ERC1271';
        }}
      />
      Account Bound
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/accounts#erc_7739_signatures">
        Enhances signature security by using a defensive rehashing scheme that prevents signature replay attacks across
        multiple smart accounts owned by the same private key. This preserves the readability of signed contents while
        ensuring each signature is uniquely bound to a specific account and chain.
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
      ERC721 Holder
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
      ERC1155 Holder
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/token/erc1155#ERC1155Holder">
        Implement native support for receiving ERC-1155 tokens.
      </HelpTooltip>
    </label>
    <label class:checked={opts.batchedExecution}>
      <input
        type="checkbox"
        checked={!!opts.batchedExecution || !!opts.ERC7579Modules}
        disabled={!!opts.ERC7579Modules}
        on:change={e => {
          opts.batchedExecution = e.currentTarget?.checked;
        }}
      />
      Batched Execution
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/accounts#batched_execution">
        Enables atomic execution of multiple transactions in a single operation, reducing total transaction costs and
        latency.
      </HelpTooltip>
    </label>
    <label class:checked={!!opts.ERC7579Modules}>
      <input
        type="checkbox"
        checked={!!opts.ERC7579Modules}
        on:change={e => {
          if (e.currentTarget?.checked) opts.ERC7579Modules = 'AccountERC7579';
          else opts.ERC7579Modules = false;
        }}
      />
      Modules
      <HelpTooltip link="https://eips.ethereum.org/EIPS/eip-7579">
        Enables a modular architecture where account functionality can be extended through installation and uninstallation of external contracts (modules)
        and enhances batched execution. Supports validators for signature verification, executors for transaction
        handling, and fallback handlers for additional features. Hooks are not supported by default.
      </HelpTooltip>
    </label>
    <label class:checked={opts.ERC7579Modules === 'AccountERC7579Hooked'} class="subcontrol">
      <input
        type="checkbox"
        checked={opts.ERC7579Modules === 'AccountERC7579Hooked'}
        on:change={e => {
          if (e.currentTarget?.checked) opts.ERC7579Modules = 'AccountERC7579Hooked';
          else opts.ERC7579Modules = 'AccountERC7579';
        }}
      />
      Hooked
      <HelpTooltip link="https://eips.ethereum.org/EIPS/eip-7579#hooks">
        Enables custom logic to be executed before and after account operations. A hook can validate transactions, track
        state changes, implement security checks, or add any custom behavior around executions and module management.
      </HelpTooltip>
    </label>
  </div>
</section>

<ExpandableToggleRadio
  label="Signer"
  bind:value={opts.signer}
  defaultValue="ECDSA"
  helpContent="Defines the base signature validation mechanism for the account. This implementation will be used to validate user operations following ERC-4337 or by ERC-1271's <code>isValidSignature</code> to verify signatures on behalf of the account."
  helpLink="https://docs.openzeppelin.com/community-contracts/accounts#selecting_a_signer"
>
  <div class="checkbox-group">
    <label class:checked={opts.signer === 'ECDSA'}>
      <input type="radio" bind:group={opts.signer} value="ECDSA" />
      ECDSA
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#ECDSA">
        Standard Ethereum signature validation using secp256k1. Validates signatures against a specified owner address,
        making it suitable for accounts controlled by EOAs.
      </HelpTooltip>
    </label>
    <label class:checked={opts.signer === 'ERC7702'}>
      <input type="radio" bind:group={opts.signer} value="ERC7702" />
      EOA Delegation
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/eoa-delegation">
        Special ECDSA validation that uses the account's own address as the signer. Enables EOAs to delegate execution
        rights to the account while maintaining their native signature verification.
      </HelpTooltip>
    </label>
    <label class:checked={opts.signer === 'Multisig'}>
      <input type="radio" bind:group={opts.signer} value="Multisig" />
      Multisig*
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/multisig">
        ERC-7913 multisignature validation requiring a minimum number of signatures to approve operations. The contract
        maintains a set of authorized signers and validates that the number of valid signatures meets the threshold
        requirement.
      </HelpTooltip>
    </label>
    <label class:checked={opts.signer === 'MultisigWeighted'}>
      <input type="radio" bind:group={opts.signer} value="MultisigWeighted" />
      Multisig Weighted*
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/multisig#multisignererc7913weighted">
        Weighted version of ERC-7913 multisignature validation. Signers have different voting weights, allowing for
        flexible governance. The total weight of valid signatures must meet the threshold requirement.
      </HelpTooltip>
    </label>
    <label class:checked={opts.signer === 'P256'}>
      <input type="radio" bind:group={opts.signer} value="P256" />
      P256
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#P256">
        Signature validation using the NIST P-256 curve (secp256r1). Useful for integrating with external systems and
        hardware that use this standardized curve, such as Apple's Passkeys or certain HSMs.
      </HelpTooltip>
    </label>
    <label class:checked={opts.signer === 'RSA'}>
      <input type="radio" bind:group={opts.signer} value="RSA" />
      RSA
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/utils#RSA">
        RSA PKCS#1 v1.5 signature validation following RFC8017. Enables integration with traditional PKI systems and
        hardware security modules that use RSA keys.
      </HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>

<InfoSection bind:info={opts.info} />
