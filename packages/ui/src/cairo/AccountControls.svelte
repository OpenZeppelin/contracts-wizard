<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';
  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-cairo';
  import { account, Account, infoDefaults } from '@openzeppelin/wizard-cairo';
  import UpgradeabilityField from './UpgradeabilityField.svelte';
  import InfoSection from './InfoSection.svelte';
  import { error } from '../common/error-tooltip';

  export const opts: Required<KindedOptions['Account']> = {
    kind: 'Account',
    ...account.defaults,
    info: { ...infoDefaults }, // create new object since Info is nested
  };

  export let errors: undefined | OptionsErrorMessages;
  export let accountType: Account | undefined;
</script>


<section class="controls-section">
  <h1>Settings</h1>

  <label class="labeled-input">
    <span>Name</span>
    <input bind:value={opts.name} use:error={errors?.name}>
  </label>
</section>

<section class="controls-section">
  <h1>Account Type</h1>
  <div class="checkbox-group">
    <label class:checked={accountType === 'stark'}>
      <input type="radio" bind:group={opts.type} value="stark">
      Starknet
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/accounts#starknet_account">
        Starknet account that uses the STARK curve for signature checking.
      </HelpTooltip>
    </label>

    <label class:checked={accountType === 'eth'}>
      <input type="radio" bind:group={opts.type} value="eth">
      Ethereum
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/accounts#ethereum_account">
        Ethereum-flavored account that uses the Secp256k1 curve for signature checking.
      </HelpTooltip>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>Features</h1>

  <div class="checkbox-group">
    <label class:checked={opts.outsideExecution}>
      <input type="checkbox" bind:checked={opts.outsideExecution}>
      Outside Execution
      <HelpTooltip link="https://github.com/starknet-io/SNIPs/blob/main/SNIPS/snip-9.md">
        Allows a protocol to submit transactions on behalf of the account, as long as it has the relevant signatures.
      </HelpTooltip>
    </label>

    <label class:checked={opts.declare}>
      <input type="checkbox" bind:checked={opts.declare}>
      Declarer
      <HelpTooltip link="https://docs.starknet.io/architecture-and-concepts/smart-contracts/contract-classes/">
        Enables the account to declare other contract classes.
      </HelpTooltip>
    </label>

    <label class:checked={opts.deploy}>
      <input type="checkbox" bind:checked={opts.deploy}>
      Deployable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/accounts#deploying_an_account">
        Enables the account to be counterfactually deployed.
      </HelpTooltip>
    </label>

    <label class:checked={opts.pubkey}>
      <input type="checkbox" bind:checked={opts.pubkey}>
      Public Key
      <HelpTooltip>
        Enables the account to change its own public key.
      </HelpTooltip>
    </label>
    <UpgradeabilityField bind:upgradeable={opts.upgradeable} />
  </div>
</section>

<InfoSection bind:info={opts.info} />
