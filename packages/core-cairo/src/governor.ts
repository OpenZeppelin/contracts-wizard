import { contractDefaults as commonDefaults, withCommonContractDefaults } from './common-options';
import { CommonContractOptions } from './common-options';
import { ContractBuilder, Contract, Value } from "./contract";
import { OptionsError } from "./error";
import { setAccessControl } from "./set-access-control";
import { printContract } from "./print";
import { setInfo } from "./set-info";
import { setUpgradeable } from "./set-upgradeable";
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
  addQuorum(c, allOpts);
  addSettings(c, allOpts);
  // addCounting(c);
  // addStorage(c, allOpts);
  // addVotes(c);
  // addTimelock(c, allOpts);

  // setAccessControl(c, allOpts.access);
  // setUpgradeable(c, allOpts.upgradeable, allOpts.access);
  // setInfo(c, allOpts.info);

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
      name: 'settings',
      type: 'GovernorSettings::Storage',
    },
    event: {
      name: 'GovernorSettingsEvent',
      type: 'GovernorSettings::Event',
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
  GovernorVotesQuorumFractionComponent: {
    path: 'openzeppelin::governance::governor::extensions',
    substorage: {
      name: 'governor_votes',
      type: 'GovernorVotesQuorumFraction::Storage',
    },
    event: {
      name: 'GovernorVotesEvent',
      type: 'GovernorVotesQuorumFraction::Event',
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
  }
});

function addBase(c: ContractBuilder, _: GovernorOptions) {
  c.addStandaloneImport('starknet::ContractAddress');
  c.addConstructorArgument({ name: 'votes_token', type: 'ContractAddress' });
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

function addQuorum(c: ContractBuilder, allOpts: Required<GovernorOptions>) {
  if (allOpts.quorumMode === 'percent') {
    if (allOpts.quorumPercent > 100) {
      throw new OptionsError({
        quorumPercent: 'Invalid percentage',
      });
    }

    addQuorumFractionComponent(c, allOpts.quorumPercent);
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

    addQuorumLocalImpl(c, quorum);
  }
}

function addQuorumFractionComponent(c: ContractBuilder, quorumNumerator: number) {
  c.addConstant({
    name: 'QUORUM_NUMERATOR',
    type: 'u256',
    value: (quorumNumerator * 10).toString(),
    comment: `${quorumNumerator}%`,
    inlineComment: true,
  });
  c.addComponent(components.GovernorVotesQuorumFractionComponent, [
    { lit: 'votes_token' },
    { lit: 'QUORUM_NUMERATOR' },
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

// function addCounting(c: ContractBuilder) {
//   c.addParent({
//     name: 'GovernorCountingSimple',
//     path: '@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol',
//   });
// }

// function addVotes(c: ContractBuilder) {
//   const tokenArg = '_token';

//   c.addImportOnly({
//     name: 'IVotes',
//     path: `@openzeppelin/contracts/governance/utils/IVotes.sol`,
//     transpiled: false,
//   });
//   c.addConstructorArgument({
//     type: {
//       name: 'IVotes',
//       transpiled: false,
//     },
//     name: tokenArg,
//   });

//   c.addParent({
//     name: 'GovernorVotes',
//     path: `@openzeppelin/contracts/governance/extensions/GovernorVotes.sol`,
//   }, [{ lit: tokenArg }]);
// }

export const numberPattern = /^(?!$)(\d*)(?:\.(\d+))?(?:e(\d+))?$/;

// const timelockModules = {
//   openzeppelin: {
//     timelockType: {
//       name: 'TimelockController',
//       path: `@openzeppelin/contracts/governance/TimelockController.sol`,
//     },
//     timelockParent: {
//       name: 'GovernorTimelockControl',
//       path: `@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol`,
//     }
//   },
//   compound: {
//     timelockType: {
//       name: 'ICompoundTimelock',
//       path: `@openzeppelin/contracts/vendor/compound/ICompoundTimelock.sol`,
//       transpiled: false,
//     },
//     timelockParent: {
//       name: 'GovernorTimelockCompound',
//       path: `@openzeppelin/contracts/governance/extensions/GovernorTimelockCompound.sol`,
//     }
//   },
// } as const;


// function addTimelock(c: ContractBuilder, { timelock }: Required<GovernorOptions>) {
//   if (timelock === false) {
//     return;
//   }

//   const timelockArg = '_timelock';
//   const { timelockType, timelockParent } = timelockModules[timelock];

//   c.addImportOnly(timelockType);
//   c.addConstructorArgument({
//     type: timelockType,
//     name: timelockArg,
//   });

//   c.addParent(timelockParent, [{ lit: timelockArg }]);
//   c.addOverride(timelockParent, functions._queueOperations);
//   c.addOverride(timelockParent, functions._executeOperations);
//   c.addOverride(timelockParent, functions._cancel);
//   c.addOverride(timelockParent, functions._executor);
//   c.addOverride(timelockParent, functions.state);
//   c.addOverride(timelockParent, functions.proposalNeedsQueuing);
// }

// function addStorage(c: ContractBuilder, { storage }: GovernorOptions) {
//   if (storage) {
//     const GovernorStorage = {
//       name: 'GovernorStorage',
//       path: '@openzeppelin/contracts/governance/extensions/GovernorStorage.sol',
//     };
//     c.addParent(GovernorStorage);
//     c.addOverride(GovernorStorage, functions._propose);
//   }
// }

// const functions = defineFunctions({
//   votingDelay: {
//     args: [],
//     returns: ['uint256'],
//     kind: 'public',
//     mutability: 'pure',
//   },
//   votingPeriod: {
//     args: [],
//     returns: ['uint256'],
//     kind: 'public',
//     mutability: 'pure',
//   },
//   proposalThreshold: {
//     args: [],
//     returns: ['uint256'],
//     kind: 'public',
//     mutability: 'pure',
//   },
//   proposalNeedsQueuing: {
//     args: [
//       { name: 'proposalId', type: 'uint256' },
//     ],
//     returns: ['bool'],
//     kind: 'public',
//     mutability: 'view',
//   },
//   quorum: {
//     args: [
//       { name: 'blockNumber', type: 'uint256' },
//     ],
//     returns: ['uint256'],
//     kind: 'public',
//     mutability: 'view',
//   },
//   quorumDenominator: {
//     args: [],
//     returns: ['uint256'],
//     kind: 'public',
//     mutability: 'view',
//   },
//   propose: {
//     args: [
//       { name: 'targets', type: 'address[] memory' },
//       { name: 'values', type: 'uint256[] memory' },
//       { name: 'calldatas', type: 'bytes[] memory' },
//       { name: 'description', type: 'string memory' },
//     ],
//     returns: ['uint256'],
//     kind: 'public',
//   },
//   _propose: {
//     args: [
//       { name: 'targets', type: 'address[] memory' },
//       { name: 'values', type: 'uint256[] memory' },
//       { name: 'calldatas', type: 'bytes[] memory' },
//       { name: 'description', type: 'string memory' },
//       { name: 'proposer', type: 'address' },
//     ],
//     returns: ['uint256'],
//     kind: 'internal',
//   },
//   _queueOperations: {
//     args: [
//       { name: 'proposalId', type: 'uint256' },
//       { name: 'targets', type: 'address[] memory' },
//       { name: 'values', type: 'uint256[] memory' },
//       { name: 'calldatas', type: 'bytes[] memory' },
//       { name: 'descriptionHash', type: 'bytes32' },
//     ],
//     kind: 'internal',
//     returns: ['uint48'],
//   },
//   _executeOperations: {
//     args: [
//       { name: 'proposalId', type: 'uint256' },
//       { name: 'targets', type: 'address[] memory' },
//       { name: 'values', type: 'uint256[] memory' },
//       { name: 'calldatas', type: 'bytes[] memory' },
//       { name: 'descriptionHash', type: 'bytes32' },
//     ],
//     kind: 'internal',
//   },
//   _cancel: {
//     args: [
//       { name: 'targets', type: 'address[] memory' },
//       { name: 'values', type: 'uint256[] memory' },
//       { name: 'calldatas', type: 'bytes[] memory' },
//       { name: 'descriptionHash', type: 'bytes32' },
//     ],
//     returns: ['uint256'],
//     kind: 'internal',
//   },
//   state: {
//     args: [
//       { name: 'proposalId', type: 'uint256' },
//     ],
//     returns: ['ProposalState'],
//     kind: 'public',
//     mutability: 'view',
//   },
//   _executor: {
//     args: [],
//     returns: ['address'],
//     kind: 'internal',
//     mutability: 'view',
//   },
// });
