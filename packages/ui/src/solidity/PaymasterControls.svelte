<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';

  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard';
  import { paymaster } from '@openzeppelin/wizard';

  import InfoSection from './InfoSection.svelte';
  import AccessControlSection from './AccessControlSection.svelte';

  export let opts: Required<KindedOptions['Paymaster']> = {
    kind: 'Paymaster',
    ...paymaster.defaults,
  };

  export let errors: undefined | OptionsErrorMessages;

  $: requireAccessControl = paymaster.isAccessControlRequired(opts);
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

<AccessControlSection bind:access={opts.access} required={requireAccessControl} />

<InfoSection bind:info={opts.info} />
