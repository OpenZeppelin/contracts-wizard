<script lang="ts">
  import HelpTooltip from '../common/HelpTooltip.svelte';
  import type { KindedOptions, OptionsErrorMessages } from '@openzeppelin/wizard';
  import { erc7579 } from '@openzeppelin/wizard';
  import InfoSection from './InfoSection.svelte';
  import AccessControlSection from './AccessControlSection.svelte';
  import type { ERC7579ValidatorType } from '@openzeppelin/wizard/src/erc7579';

  export let opts: Required<KindedOptions['ERC7579']> = {
    kind: 'ERC7579',
    ...erc7579.defaults,
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
  <h1>Features</h1>
  <div class="checkbox-group">
    <label class:checked={opts.validator}>
      <input
        type="checkbox"
        checked={opts.validator}
        on:change={e => {
          if (e.currentTarget?.checked) opts.validator = { ...erc7579.defaults.validator, ...opts.validator };
          else opts.validator = undefined;
        }}
        value="Validator"
      />
      Validator
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/api/access#Ownable">
        Handle signature verification and user operation validation.
      </HelpTooltip>
    </label>
    <label class:checked={opts.validator?.multisig} class="subcontrol">
      <input
        type="checkbox"
        checked={opts.validator?.multisig}
        on:change={e => {
          if (e.currentTarget?.checked) {
            opts.validator ??= {};
            opts.validator.multisig = true;
          } else opts.validator.multisig = undefined;
        }}
      />
      Multisig
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/0.0.1/api/account#ERC7579Executor">
        Execute operations on behalf of the account.
      </HelpTooltip>
    </label>
    <div class="checkbox-group">
      <label class:checked={opts.validator?.multisig?.weighted} class="subcontrol">
        <input
          type="checkbox"
          checked={opts.validator?.multisig?.weighted}
          on:change={e => {
            if (e.currentTarget?.checked) {
              opts.validator ??= {};
              opts.validator.multisig ??= {
                weighted: true,
              };
              opts.validator.multisig.weighted = true;
            }
            opts.validator.multisig.weighted = e.currentTarget?.checked;
          }}
        />
        Weighted
        <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/0.0.1/api/account#ERC7579DelayedExecutor">
          Schedules operations for the account and adds a delay before executing an account operation.
        </HelpTooltip>
      </label>
      <label class:checked={opts.validator?.multisig?.weighted} class="subcontrol">
        <input
          type="checkbox"
          checked={opts.validator?.multisig?.confirmation}
          on:change={e => {
            if (e.currentTarget?.checked) {
              opts.validator ??= {};
              opts.validator.multisig ??= {
                confirmation: true,
              };
              opts.validator.multisig.confirmation = true;
            }
            opts.validator.multisig.confirmation = e.currentTarget?.checked;
          }}
        />
        Confirmation
        <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/0.0.1/api/account#ERC7579DelayedExecutor">
          Schedules operations for the account and adds a delay before executing an account operation.
        </HelpTooltip>
      </label>
    </div>
    <label class:checked={opts.executor}>
      <input
        type="checkbox"
        on:change={e => {
          opts.executor = e.currentTarget?.checked;
        }}
        checked={opts.executor}
      />
      Executor
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/0.0.1/api/account#ERC7579Executor">
        Execute operations on behalf of the account.
      </HelpTooltip>
    </label>
    <label class:checked={opts.executor === 'delayed'} class="subcontrol">
      <input
        type="checkbox"
        checked={opts.executor === 'delayed'}
        on:change={e => {
          if (e.currentTarget?.checked) opts.executor = 'delayed';
          else opts.executor = true;
        }}
      />
      Delayed
      <HelpTooltip link="https://docs.openzeppelin.com/community-contracts/0.0.1/api/account#ERC7579DelayedExecutor">
        Schedules operations for the account and adds a delay before executing an account operation.
      </HelpTooltip>
    </label>
    <label class:checked={opts.hook}>
      <input
        type="checkbox"
        checked={opts.hook}
        on:change={e => {
          opts.hook = e.currentTarget?.checked;
        }}
      />
      Hook
      <HelpTooltip link="https://eips.ethereum.org/EIPS/eip-7579#hooks">
        Execute logic before and after operations.
      </HelpTooltip>
    </label>
    <label class:checked={opts.fallback}>
      <input
        type="checkbox"
        checked={opts.fallback}
        on:change={e => {
          opts.fallback = e.currentTarget?.checked;
        }}
      />
      Fallback Handler
      <HelpTooltip link="https://eips.ethereum.org/EIPS/eip-7579#fallback-handlers">
        Handle fallback calls for specific function selectors.
      </HelpTooltip>
    </label>
  </div>
</section>

<AccessControlSection bind:access={opts.access} required={false} disabled={!opts.executor} />

<InfoSection bind:info={opts.info} />
