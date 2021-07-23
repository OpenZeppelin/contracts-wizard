<script lang="ts">
  import HelpTooltip from './HelpTooltip.svelte';

  import type { GenericOptions } from '@openzeppelin/wizard';
  import { premintPattern, governorDefaults } from '@openzeppelin/wizard';

  import UpgradeabilitySection from './UpgradeabilitySection.svelte';

  export const opts: Required<GenericOptions> = {
    kind: 'Governor',
    name: 'Governor',
    delay: '1 block',
    period: '1 week',
    blockTime: governorDefaults.blockTime,
    proposalThreshold: '1000e18',
    quorum: {
      mode: 'percent',
      percent: 30,
    },
    votes: 'erc20votes',
    timelock: 'openzeppelin',
    bravo: false,
    upgradeable: false,
  };
</script>

<section class="controls-section">
  <h1>Settings</h1>

  <label class="labeled-input">
    <span>Name</span>
    <input bind:value={opts.name}>
  </label>

  <div class="grid grid-cols-1-1 grid-gap-2">
    <label class="labeled-input">
      <span>Voting Delay</span>
      <input bind:value={opts.delay}>
    </label>

    <label class="labeled-input">
      <span>Voting Period</span>
      <input bind:value={opts.period}>
    </label>
  </div>

  <label class="labeled-input">
    <span class="flex justify-between pr-2">
      Proposal Threshold
      <HelpTooltip>Create an initial amount of tokens for the deployer.</HelpTooltip>
    </span>
    <input bind:value={opts.premint} placeholder="0" pattern={premintPattern.source}>
  </label>

  <div class="checkbox-group">
    <label class:checked={opts.bravo}>
      <input type="checkbox" bind:checked={opts.bravo}>
      Bravo Compatible
      <HelpTooltip>
        Privileged accounts will be able to create more supply.
      </HelpTooltip>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>Votes</h1>

  <div class="checkbox-group">
    <label class:checked={opts.votes === 'erc20votes'}>
      <input type="radio" bind:group={opts.votes} value="erc20votes">
      ERC20Votes
      <HelpTooltip>
        Privileged accounts will be able to create more supply.
      </HelpTooltip>
    </label>

    <label class:checked={opts.votes === 'comp'}>
      <input type="radio" bind:group={opts.votes} value="comp">
      COMP
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Burnable">
        Token holders will be able to destroy their tokens.
      </HelpTooltip>
    </label>
  </div>
</section>

<section class="controls-section">
  <h1>
    <label class="flex items-center tooltip-container pr-2">
      <span>Timelock</span>
      <input type="checkbox" bind:checked={opts.timelock} class="ml-1" style="margin-top: var(--icon-adjust)">
      <HelpTooltip align="right" link="https://docs.openzeppelin.com/openzeppelin/upgrades">
      Smart contracts are immutable by default unless deployed behind an upgradeable proxy.
      </HelpTooltip>
    </label>
  </h1>
  
  <div class="checkbox-group">
    <label class:checked={opts.timelock === 'openzeppelin'}>
      <input type="radio" bind:group={opts.timelock} value="openzeppelin">
      TimelockController
      <HelpTooltip>
        Privileged accounts will be able to create more supply.
      </HelpTooltip>
    </label>

    <label class:checked={opts.timelock === 'compound'}>
      <input type="radio" bind:group={opts.timelock} value="compound">
      COMP
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Burnable">
        Token holders will be able to destroy their tokens.
      </HelpTooltip>
    </label>
  </div>
</section>

<UpgradeabilitySection bind:upgradeable={opts.upgradeable} />
