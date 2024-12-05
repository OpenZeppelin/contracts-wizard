import { contractDefaults as commonDefaults, withCommonContractDefaults } from './common-options';
import { CommonContractOptions } from './common-options';
import { ContractBuilder, Contract, Value } from "./contract";
import { OptionsError } from "./error";
import { setAccessControl } from "./set-access-control";
import { printContract } from "./print";
import { setInfo } from "./set-info";
import { setUpgradeableGovernor } from "./set-upgradeable";
import { defineFunctions } from './utils/define-functions';
import { defineComponents } from './utils/define-components';
import { durationToTimestamp } from './utils/duration';
import { addSNIP12Metadata, addSRC5Component } from './common-components';
export const clockModeOptions = ['blocknumber', 'timestamp'] as const;
export const clockModeDefault = 'timestamp' as const;
export type ClockMode = typeof clockModeOptions[number];

export const defaults: Required<GovernorOptions> = {
  name: 'MyGovernor',
  delay: '1 day',
  period: '1 week',
  votes: 'erc20votes',
  clockMode: clockModeDefault,
  timelock: 'openzeppelin',
  blockTime: 12,
  decimals: 18,
  proposalThreshold: '0',
  quorumMode: 'percent',
  quorumPercent: 4,
  quorumAbsolute: '',
  settings: true,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  appName: 'OpenZeppelin Governor',
  appVersion: 'v1',
  info: commonDefaults.info
} as const;

export const votesOptions = ['erc20votes', 'erc721votes'] as const;
export type VotesOptions = typeof votesOptions[number];

export const timelockOptions = [false, 'openzeppelin'] as const;
export type TimelockOptions = typeof timelockOptions[number];

export function printGovernor(opts: GovernorOptions = defaults): string {
  return printContract(buildGovernor(opts));
}

export interface GovernorOptions extends CommonContractOptions {
  name: string;
  delay: string;
  period: string;
  blockTime?: number;
  proposalThreshold?: string;
  decimals?: number;
  quorumMode?: 'percent' | 'absolute';
  quorumPercent?: number;
  quorumAbsolute?: string;
  votes?: VotesOptions;
  clockMode?: ClockMode;
  timelock?: TimelockOptions;
  settings?: boolean;
  appName?: string;
  appVersion?: string;
}

export function isAccessControlRequired(opts: Partial<GovernorOptions>): boolean {
  return false;
}

function withDefaults(opts: GovernorOptions): Required<GovernorOptions> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    decimals: opts.decimals ?? defaults.decimals,
    blockTime: opts.blockTime || defaults.blockTime,
    quorumPercent: opts.quorumPercent ?? defaults.quorumPercent,
    quorumAbsolute: opts.quorumAbsolute ?? defaults.quorumAbsolute,
    proposalThreshold: opts.proposalThreshold || defaults.proposalThreshold,
    settings: opts.settings ?? defaults.settings,
    quorumMode: opts.quorumMode ?? defaults.quorumMode,
    votes: opts.votes ?? defaults.votes,
    clockMode: opts.clockMode ?? defaults.clockMode,
    timelock: opts.timelock ?? defaults.timelock,
    appName: opts.appName ?? defaults.appName,
    appVersion: opts.appVersion ?? defaults.appVersion,
  };
}

export function buildGovernor(opts: GovernorOptions): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  validateDecimals(allOpts.decimals);

  addBase(c, allOpts);
  addSRC5Component(c, 'SRC5');
  addSNIP12Metadata(c, allOpts.appName, allOpts.appVersion, 'SNIP12 Metadata');
  addCounting(c, allOpts);
  addQuorumAndVotes(c, allOpts);
  addSettings(c, allOpts);
  addExecution(c, allOpts);
  // addVotes(c);
  // addTimelock(c, allOpts);

  // setAccessControl(c, allOpts.access);
  setUpgradeableGovernor(c, allOpts.upgradeable, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

const components = defineComponents( {
  GovernorComponent: {
    path: 'openzeppelin::governance::governor',
    substorage: {
      name: 'governor',
      type: 'GovernorComponent::Storage',
    },
    event: {
      name: 'GovernorEvent',
      type: 'GovernorComponent::Event',
    },
    impls: [{
      name: 'GovernorImpl',
      value: 'GovernorComponent::GovernorImpl<ContractState>',
      section: 'Governor Core',
    }],
  },
  GovernorSettingsComponent: {
    path: 'openzeppelin::governance::governor::extensions',
    substorage: {
      name: 'governor_settings',
      type: 'GovernorSettingsComponent::Storage',
    },
    event: {
      name: 'GovernorSettingsEvent',
      type: 'GovernorSettingsComponent::Event',
    },
    impls: [{
      name: 'GovernorSettingsAdminImpl',
      value: 'GovernorSettingsComponent::GovernorSettingsAdminImpl<ContractState>',
      section: 'Extensions (external)',
    }, {
      name: 'GovernorSettingsImpl',
      value: 'GovernorSettingsComponent::GovernorSettings<ContractState>',
      embed: false,
      section: 'Extensions (internal)',
    }],
  },
  GovernorVotesComponent: {
    path: 'openzeppelin::governance::governor::extensions',
    substorage: {
      name: 'governor_votes',
      type: 'GovernorVotesComponent::Storage',
    },
    event: {
      name: 'GovernorVotesEvent',
      type: 'GovernorVotesComponent::Event',
    },
    impls: [{
      name: 'VotesTokenImpl',
      value: 'GovernorVotesComponent::VotesTokenImpl<ContractState>',
      section: 'Extensions (external)',
    }, {
      name: 'GovernorVotesImpl',
      value: 'GovernorVotesComponent::GovernorVotes<ContractState>',
      embed: false,
      section: 'Extensions (internal)',
    }],
  },
  GovernorVotesQuorumFractionComponent: {
    path: 'openzeppelin::governance::governor::extensions',
    substorage: {
      name: 'governor_votes',
      type: 'GovernorVotesQuorumFractionComponent::Storage',
    },
    event: {
      name: 'GovernorVotesEvent',
      type: 'GovernorVotesQuorumFractionComponent::Event',
    },
    impls: [{
      name: 'GovernorQuorumImpl',
      value: 'GovernorVotesQuorumFractionComponent::GovernorQuorum<ContractState>',
      embed: false,
      section: 'Extensions (internal)',
    }, {
      name: 'GovernorVotesImpl',
      value: 'GovernorVotesQuorumFractionComponent::GovernorVotes<ContractState>',
      embed: false,
      section: 'Extensions (internal)',
    }, {
      name: 'QuorumFractionImpl',
      value: 'GovernorVotesQuorumFractionComponent::QuorumFractionImpl<ContractState>',
      section: 'Extensions (external)',
    }],
  },
  GovernorCountingSimpleComponent: {
    path: 'openzeppelin::governance::governor::extensions',
    substorage: {
      name: 'governor_counting',
      type: 'GovernorCountingSimpleComponent::Storage',
    },
    event: {
      name: 'GovernorCountingSimpleEvent',
      type: 'GovernorCountingSimpleComponent::Event',
    },
    impls: [{
      name: 'GovernorCountingSimpleImpl',
      value: 'GovernorCountingSimpleComponent::GovernorCounting<ContractState>',
      embed: false,
      section: 'Extensions (internal)',
    }],
  },
  GovernorCoreExecutionComponent: {
    path: 'openzeppelin::governance::governor::extensions',
    substorage: {
      name: 'governor_execution',
      type: 'GovernorCoreExecutionComponent::Storage',
    },
    event: {
      name: 'GovernorCoreExecutionEvent',
      type: 'GovernorCoreExecutionComponent::Event',
    },
    impls: [{
      name: 'GovernorCoreExecutionImpl',
      value: 'GovernorCoreExecutionComponent::GovernorExecution<ContractState>',
      embed: false,
      section: 'Extensions (internal)',
    }],
  },
  GovernorTimelockExecutionComponent: {
    path: 'openzeppelin::governance::governor::extensions',
    substorage: {
      name: 'governor_timelock_execution',
      type: 'GovernorTimelockExecutionComponent::Storage',
    },
    event: {
      name: 'GovernorTimelockExecutionEvent',
      type: 'GovernorTimelockExecutionComponent::Event',
    },
    impls: [{
      name: 'TimelockedImpl',
      value: 'GovernorTimelockExecutionComponent::TimelockedImpl<ContractState>',
      section: 'Extensions (external)',
    }, {
      name: 'GovernorTimelockExecutionImpl',
      value: 'GovernorTimelockExecutionComponent::GovernorExecution<ContractState>',
      embed: false,
      section: 'Extensions (internal)',
    }],
  },
});

function addBase(c: ContractBuilder, _: GovernorOptions) {
  c.addStandaloneImport('starknet::ContractAddress');
  c.addConstructorArgument({ name: 'votes_token', type: 'ContractAddress' });
  c.addStandaloneImport('openzeppelin::governance::governor::GovernorComponent::InternalTrait as GovernorInternalTrait');
  c.addComponent(components.GovernorComponent, [], true);
}

function addSettings(c: ContractBuilder, allOpts: Required<GovernorOptions>) {
  c.addConstant({
    name: 'VOTING_DELAY',
    type: 'u64',
    value: getVotingDelay(allOpts).toString(),
    comment: allOpts.delay,
    inlineComment: true,
  });
  c.addConstant({
    name: 'VOTING_PERIOD',
    type: 'u64',
    value: getVotingPeriod(allOpts).toString(),
    comment: allOpts.period,
    inlineComment: true,
  });
  c.addConstant({
    name: 'PROPOSAL_THRESHOLD',
    type: 'u256',
    value: getProposalThreshold(allOpts),
  });

  if (allOpts.settings) {
    c.addStandaloneImport('openzeppelin::governance::governor::GovernorSettingsComponent::InternalTrait as GovernorSettingsInternalTrait');
    c.addComponent(components.GovernorSettingsComponent, [
      { lit: 'VOTING_DELAY' },
      { lit: 'VOTING_PERIOD' },
      { lit: 'PROPOSAL_THRESHOLD' },
    ], true);
  } else {
    addSettingsLocalImpl(c, allOpts);
  }
}

function getVotingDelay(opts: Required<GovernorOptions>): number {
  try {
    if (opts.clockMode === 'timestamp') {
       return durationToTimestamp(opts.delay);
    } else {
      throw new Error('Invalid clock mode');
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new OptionsError({
        delay: e.message,
      });
    } else {
      throw e;
    }
  }
}

function getVotingPeriod(opts: Required<GovernorOptions>): number {
  try {
    if (opts.clockMode === 'timestamp') {
        return durationToTimestamp(opts.period);
    } else {
      throw new Error('Invalid clock mode');
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new OptionsError({
        period: e.message,
      });
    } else {
      throw e;
    }
  }
}

function validateDecimals(decimals: number) {
  if (!/^\d+$/.test(decimals.toString())) {
    throw new OptionsError({
      decimals: 'Not a valid number',
    });
  }
}

function getProposalThreshold({ proposalThreshold, decimals, votes }: Required<GovernorOptions>): string {
  if (!/^\d+$/.test(proposalThreshold)) {
    throw new OptionsError({
      proposalThreshold: 'Not a valid number',
    });
  }

  if (/^0+$/.test(proposalThreshold) || decimals === 0 || votes === 'erc721votes') {
    return proposalThreshold;
  } else {
    return `${proposalThreshold}e${decimals}`; // TODO: use the corelib pow function
  }
}

function addSettingsLocalImpl(c: ContractBuilder, _: Required<GovernorOptions>) {
  const settingsTrait = {
    name: 'GovernorSettings',
    of: 'GovernorComponent::GovernorSettingsTrait<ContractState>',
    tags: [],
    section: 'Locally implemented extensions',
    priority: 2,
  };
  c.addImplementedTrait(settingsTrait);

  c.addFunction(settingsTrait, {
    name: 'voting_delay',
    args: [{
      name: 'self',
      type: '@GovernorComponent::ComponentState<ContractState>'
    }],
    returns: 'u64',
    code: ['VOTING_DELAY'],
  });

  c.addFunction(settingsTrait, {
    name: 'voting_period',
    args: [{
      name: 'self',
      type: '@GovernorComponent::ComponentState<ContractState>'
    }],
    returns: 'u64',
    code: ['VOTING_PERIOD'],
  });

  c.addFunction(settingsTrait, {
    name: 'proposal_threshold',
    args: [{
      name: 'self',
      type: '@GovernorComponent::ComponentState<ContractState>'
    }],
    returns: 'u256',
    code: ['PROPOSAL_THRESHOLD'],
  });
}

function addQuorumAndVotes(c: ContractBuilder, allOpts: Required<GovernorOptions>) {
  if (allOpts.quorumMode === 'percent') {
    if (allOpts.quorumPercent > 100) {
      throw new OptionsError({
        quorumPercent: 'Invalid percentage',
      });
    }

    addVotesQuorumFractionComponent(c, allOpts.quorumPercent);
  }
  else if (allOpts.quorumMode === 'absolute') {
    if (!numberPattern.test(allOpts.quorumAbsolute)) {
      throw new OptionsError({
        quorumAbsolute: 'Not a valid number',
      });
    }

    let quorum = (allOpts.decimals === 0 || allOpts.votes === 'erc721votes') ?
      `${allOpts.quorumAbsolute}` :
      `${allOpts.quorumAbsolute}e${allOpts.decimals}`; // TODO: use the corelib pow function

    addVotesComponent(c, allOpts);
    addQuorumLocalImpl(c, quorum);
  }
}

function addVotesQuorumFractionComponent(c: ContractBuilder, quorumNumerator: number) {
  c.addConstant({
    name: 'QUORUM_NUMERATOR',
    type: 'u256',
    value: (quorumNumerator * 10).toString(),
    comment: `${quorumNumerator}%`,
    inlineComment: true,
  });
  c.addStandaloneImport('openzeppelin::governance::governor::GovernorVotesQuorumFractionComponent::InternalTrait as GovernorVotesQuorumFractionInternalTrait');
  c.addComponent(components.GovernorVotesQuorumFractionComponent, [
    { lit: 'votes_token' },
    { lit: 'QUORUM_NUMERATOR' },
  ], true);
}

function addVotesComponent(c: ContractBuilder, _: Required<GovernorOptions>) {
  c.addStandaloneImport('openzeppelin::governance::governor::GovernorVotesComponent::InternalTrait as GovernorVotesInternalTrait');
  c.addComponent(components.GovernorVotesComponent, [
    { lit: 'votes_token' },
  ], true);
}

function addQuorumLocalImpl(c: ContractBuilder, quorum: string) {
  c.addConstant({
    name: 'QUORUM',
    type: 'u256',
    value: quorum,
  });
  const quorumTrait = {
    name: 'GovernorQuorum',
    of: 'GovernorComponent::GovernorQuorumTrait<ContractState>',
    tags: [],
    section: 'Locally implemented extensions',
    priority: 1,
  };
  c.addImplementedTrait(quorumTrait);

  c.addFunction(quorumTrait, {
    name: 'quorum',
    args: [{
      name: 'self',
      type: '@GovernorComponent::ComponentState<ContractState>'
    }, {
      name: 'timepoint',
      type: 'u64',
    }],
    returns: 'u256',
    code: ['QUORUM'],
  });
}

function addCounting(c: ContractBuilder, _: Required<GovernorOptions>) {
  c.addComponent(components.GovernorCountingSimpleComponent, [], false);
}

function addExecution(c: ContractBuilder, { timelock }: Required<GovernorOptions>) {
  if (timelock === false) {
    c.addComponent(components.GovernorCoreExecutionComponent, [], false);
  } else {
    c.addConstructorArgument({ name: 'timelock_controller', type: 'ContractAddress' });
    c.addStandaloneImport('openzeppelin::governance::governor::GovernorTimelockExecutionComponent::InternalTrait as GovernorTimelockExecutionInternalTrait');
    c.addComponent(components.GovernorTimelockExecutionComponent, [
      { lit: 'timelock_controller' },
    ], true);
  }
}

export const numberPattern = /^(?!$)(\d*)(?:\.(\d+))?(?:e(\d+))?$/;
