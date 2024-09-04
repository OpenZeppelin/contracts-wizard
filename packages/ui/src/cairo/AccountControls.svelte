<script lang="ts">
    import HelpTooltip from '../HelpTooltip.svelte';
  
    import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard-cairo';
    import { account, Account, infoDefaults } from '@openzeppelin/wizard-cairo';
    import AccessControlSection from './AccessControlSection.svelte';

    import UpgradeabilityField from './UpgradeabilityField.svelte';
    import InfoSection from './InfoSection.svelte';
    import { error } from '../error-tooltip';
    import ToggleRadio from '../inputs/ToggleRadio.svelte';
    
    export const opts: Required<KindedOptions['Account']> = {
      kind: 'Account',
      ...account.defaults,
      info: { ...infoDefaults }, // create new object since Info is nested
    };
  
    export let errors: undefined | OptionsErrorMessages;

    export let accountType: Account;
    export let required: boolean;
    let defaultValueWhenEnabled: 'account' | 'eth_account';


  </script>
  
  <section class="controls-section">
    <h1>Account Type</h1>
      <div class="checkbox-group">
        <label>
          <input type="radio" bind:group={accountType} value="account">
          Starknet
          <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/access#ownership_and_ownable">
            Standard Starknet account using the Stark curve.
          </HelpTooltip>
        </label>
        <label class:checked={accountType === 'ethAccount'}>
          <input type="radio" bind:group={accountType} value="ethAccount">
          Ethereum
          <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/access#role_based_accesscontrol">
            Ethereum-flavored account using the Secp256k1 curve.
          </HelpTooltip>
        </label>
      </div>
  </section>

  <section class="controls-section">
    <h1>Features</h1>

    <div class="checkbox-group">
      <label >
        <input type="checkbox" >
        Declarable
        <HelpTooltip link="https://docs.openzeppelin.com/contracts-cairo/account">
          Privileged accounts will be able to emit new tokens.
        </HelpTooltip>
      </label>
      <label >
        <input type="checkbox" >
        Deployable
        <HelpTooltip>
          Token holders will be able to destroy their tokens.
        </HelpTooltip>
      </label>
      <UpgradeabilityField bind:upgradeable={opts.upgradeable} />
    </div>
  </section>

  <InfoSection bind:info={opts.info} />
