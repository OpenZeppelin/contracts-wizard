<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-stellar';
  import { account, infoDefaults } from '@openzeppelin/wizard-stellar';

  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import InfoSection from './InfoSection.svelte';
  import { error } from '../common/error-tooltip';

  export let opts: Required<KindedOptions['Account']> = {
    kind: 'Account',
    ...account.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <label class="labeled-input">
    <span>Name</span>
    <input bind:value={opts.name} use:error={errors?.name} />
  </label>
</section>

<section class="controls-section">
  <h1 class="flex justify-between">
    Signers
    <HelpTooltip placement="left">
      The kinds of key the account accepts. Ed25519 and WebAuthn keys are checked by a verifier contract whose address
      you pass when deploying: pick one you trust from the OpenZeppelin registry
      <a href="https://testnet.rgstry.xyz/" target="_blank" rel="noopener noreferrer">testnet</a>
      or
      <a href="https://stellar.rgstry.xyz/" target="_blank" rel="noopener noreferrer">mainnet</a>. The address must be a
      live verifier contract, otherwise deployment fails: the account canonicalizes every key through its verifier while
      it is being constructed. One verifier serves all keys of its kind.
    </HelpTooltip>
  </h1>

  <div class="checkbox-group">
    <label class:checked={opts.delegatedSigners}>
      <input type="checkbox" bind:checked={opts.delegatedSigners} use:error={errors?.delegatedSigners} />
      Delegated
      <HelpTooltip>
        Stellar addresses, either accounts or contracts. The host verifies their signatures, so they need no verifier
        contract.
      </HelpTooltip>
    </label>
    <label class:checked={opts.ed25519Signers}>
      <input type="checkbox" bind:checked={opts.ed25519Signers} />
      Ed25519
      <HelpTooltip>
        Raw 32-byte Ed25519 public keys, checked by an Ed25519 verifier contract. Useful for keys held outside a Stellar
        account.
      </HelpTooltip>
    </label>
    <label class:checked={opts.webauthnSigners}>
      <input type="checkbox" bind:checked={opts.webauthnSigners} />
      WebAuthn (passkey)
      <HelpTooltip>
        Passkeys, checked by a WebAuthn verifier contract. Each key is the 65-byte secp256r1 public key followed by the
        credential id. Passkeys are bound to the domain that created them.
      </HelpTooltip>
    </label>
  </div>
</section>

<ExpandableToggleRadio
  label="Policy"
  bind:value={opts.policy}
  defaultValue="simple-threshold"
  helpContent="How the account decides that an operation is authorized. Turned off, every signer must sign (n-of-n). Each threshold policy is a separate contract whose address you pass when deploying, along with the threshold itself; take one you trust from the OpenZeppelin registry at testnet.rgstry.xyz or stellar.rgstry.xyz."
  helpLink="https://docs.openzeppelin.com/stellar-contracts/accounts/policies"
>
  <div class="checkbox-group">
    <label class:checked={opts.policy === 'simple-threshold'}>
      <input type="radio" bind:group={opts.policy} value="simple-threshold" />
      Simple threshold
      <HelpTooltip>
        Any m of the n signers can authorize an operation, the usual multisig. The threshold is set at deployment and
        can be changed afterwards through the policy.
      </HelpTooltip>
    </label>
    <label class:checked={opts.policy === 'weighted-threshold'}>
      <input type="radio" bind:group={opts.policy} value="weighted-threshold" />
      Weighted threshold
      <HelpTooltip>
        Each signer carries a weight and the authorizing weights must reach the threshold. Weights are passed at
        deployment as one list, aligned with the signer order the generated contract documents.
      </HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.executionEntryPoint}>
      <input type="checkbox" bind:checked={opts.executionEntryPoint} />
      Execution entry point
      <HelpTooltip>
        Lets the account call other contracts on its own behalf, which is how it manages contracts it owns such as its
        own policy. Keep this on unless you know the account never needs to initiate a call.
      </HelpTooltip>
    </label>
    <label class:checked={opts.upgradeable}>
      <input type="checkbox" bind:checked={opts.upgradeable} />
      Upgradeable
      <HelpTooltip>
        Allows the contract to be upgraded. The account authorizes its own upgrade through its signers and policy, so
        there is no separate owner or role.
      </HelpTooltip>
    </label>
  </div>
</section>

<InfoSection bind:info={opts.info} {errors} />
