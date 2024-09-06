<script lang="ts">
    import HelpTooltip from '../HelpTooltip.svelte';

    import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-cairo';
    import { account, Account, infoDefaults } from '@openzeppelin/wizard-cairo';
    import AccessControlSection from './AccessControlSection.svelte';

    import UpgradeabilityField from './UpgradeabilityField.svelte';
    import InfoSection from './InfoSection.svelte';
    import { error } from '../error-tooltip';

    export const opts: Required<KindedOptions['Account']> = {
      kind: 'Account',
      ...account.defaults,
      info: { ...infoDefaults }, // create new object since Info is nested
    };

    export let errors: undefined | OptionsErrorMessages;

    export let accountType: Account;
    export let required: boolean;

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
        <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/access#ownership_and_ownable">
          Simple mechanism with a single account authorized for all privileged actions.
        </HelpTooltip>
      </label>
      <label class:checked={accountType === 'eth'}>
        <input type="radio" bind:group={opts.type} value="eth">
        Ethereum
        <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/access#role_based_accesscontrol">
          Flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.
        </HelpTooltip>
      </label>
    </div>
  </section>


  <section class="controls-section">
    <h1>Features</h1>

    <div class="checkbox-group">
      <label class:checked={opts.declare}>
        <input type="checkbox" bind:checked={opts.declare}>
        Declarable
        <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/account">
          Privileged accounts will be able to emit new tokens.
        </HelpTooltip>
      </label>
      <label class:checked={opts.deploy}>
        <input type="checkbox" bind:checked={opts.deploy}>
        Deployable
        <HelpTooltip>
          Token holders will be able to destroy their tokens.
        </HelpTooltip>
      </label>
      <label class:checked={opts.pubkey}>
        <input type="checkbox" bind:checked={opts.pubkey}>
        Public Key
        <HelpTooltip>
          The public key can be reset by the owner.
        </HelpTooltip>
      </label>
      <UpgradeabilityField bind:upgradeable={opts.upgradeable} />
    </div>
  </section>

  <InfoSection bind:info={opts.info} />
